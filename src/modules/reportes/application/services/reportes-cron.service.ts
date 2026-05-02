import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportesService } from './reportes.service';

@Injectable()
export class ReportesCronService {
  private readonly logger = new Logger(ReportesCronService.name);

  constructor(private readonly reportesService: ReportesService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireOldIncidents() {
    const result = await this.reportesService.expireOldIncidents();
    if (result.count > 0) {
      this.logger.log(`Expired ${result.count} old incidents`);
    }
  }
}
