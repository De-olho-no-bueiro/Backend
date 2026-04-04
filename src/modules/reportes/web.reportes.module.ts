import { Module } from '@nestjs/common';
import { ReportesModule } from './reportes.module';
import { WebReportesController } from './web.reportes.controller';

@Module({
  imports: [ReportesModule],
  controllers: [WebReportesController],
})
export class WebReportesModule {}
