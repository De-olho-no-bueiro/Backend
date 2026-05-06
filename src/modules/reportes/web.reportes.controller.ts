import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportesService } from './application/services/reportes.service';

@ApiTags('web-reportes')
@Controller('web/v1/reportes')
export class WebReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar Reportes/Alagamentos simples (Painel)' })
  async getReportes() {
    return this.reportesService.getReportes();
  }
}

@ApiTags('web-manholes')
@Controller('web/v1/manholes')
export class WebManholesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar Bueiros (Painel)' })
  async getManholes() {
    return this.reportesService.getManholes();
  }
}

@ApiTags('web-flood-areas')
@Controller('web/v1/flood-areas')
export class WebFloodAreasController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar Áreas de Alagamento (Painel)' })
  async getFloodAreas() {
    return this.reportesService.getFloodAreas();
  }
}

@ApiTags('public-reportes')
@Controller('public/v1/reportes')
export class PublicReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar reportes publicos' })
  async getReportes() {
    return this.reportesService.getPublicMapData();
  }
}

@ApiTags('public-manholes')
@Controller('public/v1/manholes')
export class PublicManholesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar bueiros publicos' })
  async getManholes() {
    return this.reportesService.getManholes();
  }
}

@ApiTags('public-flood-areas')
@Controller('public/v1/flood-areas')
export class PublicFloodAreasController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar areas de alagamento publicas' })
  async getFloodAreas() {
    return this.reportesService.getFloodAreas();
  }
}
