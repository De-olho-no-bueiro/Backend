import { Module } from '@nestjs/common';
import { ReportesModule } from './reportes.module';
import { MobileReportesController, MobileManholesController, MobileFloodAreasController } from './mobile.reportes.controller';

@Module({
  imports: [ReportesModule],
  controllers: [MobileReportesController, MobileManholesController, MobileFloodAreasController],
})
export class MobileReportesModule {}
