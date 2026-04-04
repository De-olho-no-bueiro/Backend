import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ReportesService } from './application/services/reportes.service';

@Module({
  imports: [PrismaModule],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
