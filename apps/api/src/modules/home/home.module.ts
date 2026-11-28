import { Module } from '@nestjs/common';

import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { RoutesModule } from '../routes/routes.module';

@Module({
  imports: [RoutesModule],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule {}
