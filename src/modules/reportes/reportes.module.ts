import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ReportesService } from './application/services/reportes.service';
import { ReportesCronService } from './application/services/reportes-cron.service';

@Module({
  imports: [PrismaModule],
  providers: [ReportesService, ReportesCronService],
  exports: [ReportesService],
})
export class ReportesModule {}
