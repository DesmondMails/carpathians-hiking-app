import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, UnrecoverableError } from 'bullmq';

import {
  POI_ENRICHMENT_CONCURRENCY,
  POI_ENRICHMENT_JOB_NAME,
} from '../constants';
import { PoiEnrichmentService } from '../poi-enrichment.service';

@Processor('enrichment-pois', {
  concurrency: POI_ENRICHMENT_CONCURRENCY,
})
export class EnrichmentPoisConsumer extends WorkerHost {
  private readonly logger = new Logger(EnrichmentPoisConsumer.name);

  constructor(private readonly poiEnrichmentService: PoiEnrichmentService) {
    super();
  }

  async process(job: Job<{ routeId: string }>): Promise<void> {
    this.logger.log(`EnrichmentPoisConsumer processing: ${job.name}`);

    switch (job.name) {
      case POI_ENRICHMENT_JOB_NAME:
        return await this.poiEnrichmentService.enrichRoutePois(
          job.data.routeId,
        );
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  @OnWorkerEvent('failed')
  async onWorkerFailed(
    job: Job<{ routeId: string }> | undefined,
    error: Error,
  ): Promise<void> {
    this.logger.warn(`EnrichmentPoisConsumer failed: ${error.message}`, {
      job: job?.name,
      error: error.message,
      cause: error.cause,
    });

    if (!job || job.name !== POI_ENRICHMENT_JOB_NAME) return;

    const isLastAttempt = job.attemptsMade >= (job.opts.attempts ?? 1);
    const isUnrecoverable =
      error instanceof UnrecoverableError ||
      error.name === 'UnrecoverableError';

    if (!isLastAttempt && !isUnrecoverable) return;

    try {
      await this.poiEnrichmentService.markRouteEnrichmentFailed(
        job.data.routeId,
        error,
      );
    } catch (statusError) {
      // Worker event listeners are not retried as jobs by BullMQ.
      this.logger.error(
        `Could not persist FAILED for route=${job.data.routeId}, job=${job.id}`,
        statusError instanceof Error ? statusError.stack : String(statusError),
      );
    }
  }
}
