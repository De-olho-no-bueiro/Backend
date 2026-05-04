import { Module } from '@nestjs/common';
import { ReportesModule } from './reportes.module';
import {
  WebReportesController,
  WebManholesController,
  WebFloodAreasController,
  PublicReportesController,
  PublicManholesController,
  PublicFloodAreasController,
} from './web.reportes.controller';

@Module({
  imports: [ReportesModule],
  controllers: [
    WebReportesController,
    WebManholesController,
    WebFloodAreasController,
    PublicReportesController,
    PublicManholesController,
    PublicFloodAreasController,
  ],
})
export class WebReportesModule {}
