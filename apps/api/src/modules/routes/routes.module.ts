import { Module } from '@nestjs/common';

import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { PoiEnrichmentModule } from '../poi-enrichment/poi-enrichment.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  providers: [RoutesService],
  exports: [RoutesService],
  controllers: [RoutesController],
  imports: [StorageModule, PoiEnrichmentModule],
})
export class RoutesModule {}
