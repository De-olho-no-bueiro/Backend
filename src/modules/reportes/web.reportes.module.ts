import { Module } from '@nestjs/common';
import { ReportesModule } from './reportes.module';
import { WebReportesController, WebManholesController, WebFloodAreasController } from './web.reportes.controller';

@Module({
  imports: [ReportesModule],
  controllers: [WebReportesController, WebManholesController, WebFloodAreasController],
})
export class WebReportesModule {}
