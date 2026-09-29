import { Injectable, Logger } from '@nestjs/common';

import { OverpassQueryBuilderService } from './overpass-query-builder.service';
import {
  OverpassBBox,
  OverpassElement,
  OverpassResponse,
} from './poi-enrichment.types';

const DEFAULT_OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const DEFAULT_OVERPASS_USER_AGENT =
  'hiking-app-poi-enrichment/1.0 (contact: support@hiking.app)';
const REQUEST_TIMEOUT_MS = 15000;
const MAX_ATTEMPTS = 3;

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

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
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

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`Overpass HTTP ${response.status}`);
        }

        const payload = (await response.json()) as OverpassResponse;
        const elements = Array.isArray(payload.elements)
          ? payload.elements
          : [];

        this.logger.log(
          `Overpass success in ${Date.now() - startedAt}ms, attempt=${attempt}, elements=${elements.length}`,
        );

        return elements;
      } catch (error) {
        clearTimeout(timeout);

        const message = error instanceof Error ? error.message : String(error);

        this.logger.warn(
          `Overpass request failed attempt=${attempt}/${MAX_ATTEMPTS}: ${message}`,
        );

        if (attempt === MAX_ATTEMPTS) {
          throw error;
        }

        await this.delay(attempt * 500);
      }
    }

    return [];
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
