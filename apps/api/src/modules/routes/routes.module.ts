import { Module } from '@nestjs/common';

import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';

@Module({
  providers: [RoutesService],
  exports: [RoutesService],
  controllers: [RoutesController],
})
export class RoutesModule {}
