import { Module } from '@nestjs/common';

import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  providers: [RoutesService],
  exports: [RoutesService],
  controllers: [RoutesController],
  imports: [StorageModule],
})
export class RoutesModule {}
