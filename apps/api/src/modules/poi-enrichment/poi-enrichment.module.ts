import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import {
  POI_ENRICHMENT_ATTEMPTS,
  POI_ENRICHMENT_BACKOFF_TYPE,
  POI_ENRICHMENT_BACKOFF_DELAY,
} from './constants';
import { EnrichmentPoisConsumer } from './consumers/enrichment.worker';
import { OverpassClientService } from './overpass-client.service';
import { OverpassQueryBuilderService } from './overpass-query-builder.service';
import { PoiEnrichmentService } from './poi-enrichment.service';
import { PoiNormalizerService } from './poi-normalizer.service';
import { PoiRouteGeometryService } from './poi-route-geometry.service';

@Module({
  providers: [
    PoiEnrichmentService,
    PoiNormalizerService,
    PoiRouteGeometryService,
    OverpassClientService,
    OverpassQueryBuilderService,
    EnrichmentPoisConsumer,
  ],
  imports: [
    BullModule.registerQueue({
      name: 'enrichment-pois',
      defaultJobOptions: {
        attempts: POI_ENRICHMENT_ATTEMPTS,
        backoff: {
          type: POI_ENRICHMENT_BACKOFF_TYPE,
          delay: POI_ENRICHMENT_BACKOFF_DELAY,
        },
      },
    }),
  ],
  exports: [PoiEnrichmentService],
})
export class PoiEnrichmentModule {}
