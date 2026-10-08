import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { TestQueueWorker } from './test-queue.worker';
import { PoiEnrichmentModule } from '../poi-enrichment/poi-enrichment.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  providers: [RoutesService, TestQueueWorker],
  exports: [RoutesService],
  controllers: [RoutesController],
  imports: [
    StorageModule,
    PoiEnrichmentModule,
    BullModule.registerQueue({
      name: 'test-queue',
    }),
  ],
})
export class RoutesModule {}
