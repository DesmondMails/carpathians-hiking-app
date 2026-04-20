import { Module } from '@nestjs/common';

import { GpxParserService } from './gpx/gpx-parser.service';
import { RoutesDraftController } from './routes-draft.controller';
import { RoutesDraftService } from './routes-draft.service';
import { RoutesModule } from '../routes/routes.module';

@Module({
  imports: [RoutesModule],
  providers: [RoutesDraftService, GpxParserService],
  controllers: [RoutesDraftController],
})
export class RoutesDraftModule {}
