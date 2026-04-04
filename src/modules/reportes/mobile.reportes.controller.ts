import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportesService } from './application/services/reportes.service';

@ApiTags('mobile-reportes')
@Controller('mobile/v1/reportes')
export class MobileReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar Reportes/Alagamentos simples (Mobile)' })
  async getReportes() {
    return this.reportesService.getReportes();
  }

  @Post()
  @ApiOperation({ summary: 'Criar Reporte/Alagamento simples (Mobile)' })
  async createReporte(@Body() createDto: any) {
    return this.reportesService.createReporte(createDto);
  }
}

@ApiTags('mobile-manholes')
@Controller('mobile/v1/manholes')
export class MobileManholesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar Bueiros (Mobile)' })
  async getManholes() {
    return this.reportesService.getManholes();
  }

  @Post()
  @ApiOperation({ summary: 'Criar Bueiro (Mobile)' })
  async createManhole(@Body() createDto: any) {
    return this.reportesService.createManhole(createDto);
  }
}

@ApiTags('mobile-flood-areas')
@Controller('mobile/v1/flood-areas')
export class MobileFloodAreasController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar Áreas de Alagamento (Mobile)' })
  async getFloodAreas() {
    return this.reportesService.getFloodAreas();
  }

  @Post()
  @ApiOperation({ summary: 'Criar Área de Alagamento (Mobile)' })
  async createFloodArea(@Body() createDto: any) {
    return this.reportesService.createFloodArea(createDto);
  }
}
