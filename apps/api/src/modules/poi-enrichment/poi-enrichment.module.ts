import { Module } from '@nestjs/common';

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
  ],
  exports: [PoiEnrichmentService],
})
export class PoiEnrichmentModule {}
