import { Injectable, Logger } from '@nestjs/common';
import { UnrecoverableError } from 'bullmq';

import {
  RETIAABLE_OVERPASS_ERROR,
  UNRECOVERABLE_OVERPASS_ERROR,
} from './constants';
import { OverpassQueryBuilderService } from './overpass-query-builder.service';
import {
  OverpassBBox,
  OverpassElement,
  OverpassResponse,
} from './poi-enrichment.types';

const DEFAULT_OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const DEFAULT_OVERPASS_USER_AGENT =
  'hiking-app-poi-enrichment/1.0 (contact: support@hiking.app)';
const REQUEST_TIMEOUT_MS = 27000;

const retriableErrorCodes = [408, 429, 500, 502, 503, 504];

const retriableNetworkCodes = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ECONNABORTED',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'ENETUNREACH',
  'EHOSTUNREACH',
  'EPIPE',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_BODY_TIMEOUT',
  'UND_ERR_SOCKET',
]);

function isRetriableNetworkError(
  error: unknown,
  seen = new Set<unknown>(),
): boolean {
  if (!(error instanceof Error) || seen.has(error)) return false;
  seen.add(error);

  // Node fetch wraps transport failures in TypeError.cause; connection
  // attempts to multiple addresses may also produce an AggregateError.
  if (
    'code' in error &&
    typeof error.code === 'string' &&
    retriableNetworkCodes.has(error.code)
  )
    return true;

  if (
    error instanceof AggregateError &&
    error.errors.length > 0 &&
    error.errors.every((cause: unknown) =>
      isRetriableNetworkError(cause, new Set(seen)),
    )
  ) {
    return true;
  }

  return isRetriableNetworkError(error.cause, seen);
}

@Injectable()
export class OverpassClientService {
  private readonly logger = new Logger(OverpassClientService.name);
  private readonly endpoint =
    process.env.OVERPASS_API_URL ?? DEFAULT_OVERPASS_URL;
  private readonly userAgent =
    process.env.OVERPASS_USER_AGENT ?? DEFAULT_OVERPASS_USER_AGENT;

  constructor(private readonly queryBuilder: OverpassQueryBuilderService) {}

  async fetchPoiElements(bbox: OverpassBBox): Promise<OverpassElement[]> {
    const query = this.queryBuilder.buildPoiQueryForBbox(bbox);
    const startedAt = Date.now();

    const controller = new AbortController();

    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'text/plain',
          'User-Agent': this.userAgent,
        },
        body: query,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Overpass HTTP ${response.status}`, {
          cause: response.status,
        });
      }

      const payload = (await response.json()) as OverpassResponse;
      const elements = Array.isArray(payload.elements) ? payload.elements : [];

      this.logger.log(
        `Overpass success in ${Date.now() - startedAt}ms, elements=${elements.length}`,
      );

      return elements;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.warn(`Overpass request failed: ${message}`);

      const isRetriableErrorCode =
        error instanceof Error &&
        typeof error.cause === 'number' &&
        retriableErrorCodes.includes(error.cause);

      const isRequestAborted =
        error instanceof Error && controller.signal.aborted;

      const shouldRetry =
        isRetriableErrorCode ||
        isRequestAborted ||
        isRetriableNetworkError(error);

      if (shouldRetry) {
        throw new Error(`${RETIAABLE_OVERPASS_ERROR}: ${message}`, {
          cause: error,
        });
      }

      const unrecoverable = new UnrecoverableError(
        `${UNRECOVERABLE_OVERPASS_ERROR}: ${message}`,
      );
      unrecoverable.cause = error;
      throw unrecoverable;
    } finally {
      clearTimeout(timeout);
    }
  }
}
