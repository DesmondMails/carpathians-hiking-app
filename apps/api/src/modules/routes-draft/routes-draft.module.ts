import { Module } from '@nestjs/common';

import { GpxParserService } from './gpx/gpx-parser.service';
import { RoutesDraftController } from './routes-draft.controller';
import { RoutesDraftService } from './routes-draft.service';
import { RoutesModule } from '../routes/routes.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [RoutesModule, StorageModule],
  providers: [RoutesDraftService, GpxParserService],
  controllers: [RoutesDraftController],
})
export class RoutesDraftModule {}
