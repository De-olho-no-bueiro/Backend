import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportesService } from './application/services/reportes.service';

@ApiTags('web-reportes')
@Controller('web/v1/reportes')
export class WebReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os reportes no painel administrativo' })
  async getAllReports() {
    // Pode retornar uma visão agregada
    const [reportes, manholes, areas] = await Promise.all([
      this.reportesService.getReportes(),
      this.reportesService.getManholes(),
      this.reportesService.getFloodAreas(),
    ]);
    return { reportes, manholes, areas };
  }
}
