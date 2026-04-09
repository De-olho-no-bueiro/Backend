import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ReportesService } from './application/services/reportes.service';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';

@ApiTags('mobile-reportes')
@ApiBearerAuth()
@Controller('mobile/v1/reportes')
export class MobileReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar Reportes/Alagamentos simples (Mobile)' })
  async getReportes() {
    return this.reportesService.getReportes();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Criar Reporte/Alagamento simples (Mobile)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tipo: { type: 'string', example: 'alagamento' },
        nivel: { type: 'string', example: 'baixo' },
        latitude: { type: 'number', example: -23.123 },
        longitude: { type: 'number', example: -46.123 },
        endereco: { type: 'string', example: 'Rua Exemplo' },
        descricao: { type: 'string', example: 'Asfaltamento ruim' },
        midias: { type: 'array', items: { type: 'string' }, example: ['base64string1', 'base64string2'] }
      }
    }
  })
  async createReporte(@Body() createDto: any, @Req() req: any) {
    return this.reportesService.createReporte(createDto, req.user.userId);
  }
}

@ApiTags('mobile-manholes')
@ApiBearerAuth()
@Controller('mobile/v1/manholes')
export class MobileManholesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar Bueiros (Mobile)' })
  async getManholes() {
    return this.reportesService.getManholes();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Criar Bueiro (Mobile)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        latitude: { type: 'number', example: -23.123 },
        longitude: { type: 'number', example: -46.123 },
        descricao: { type: 'string', example: 'Bueiro sem tampa no canteiro' },
        midias: { type: 'array', items: { type: 'string' }, example: ['base64string'] }
      }
    }
  })
  async createManhole(@Body() createDto: any, @Req() req: any) {
    return this.reportesService.createManhole(createDto, req.user.userId);
  }
}

@ApiTags('mobile-flood-areas')
@ApiBearerAuth()
@Controller('mobile/v1/flood-areas')
export class MobileFloodAreasController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar Áreas de Alagamento (Mobile)' })
  async getFloodAreas() {
    return this.reportesService.getFloodAreas();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Criar Área de Alagamento (Mobile)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        coordinates: { type: 'array', example: [{ latitude: -23.1, longitude: -46.1 }, { latitude: -23.2, longitude: -46.2 }] },
        nivel: { type: 'string', example: 'medio' },
        descricao: { type: 'string', example: 'Cruzamento alagado' },
        midias: { type: 'array', items: { type: 'string' }, example: [] }
      }
    }
  })
  async createFloodArea(@Body() createDto: any, @Req() req: any) {
    return this.reportesService.createFloodArea(createDto, req.user.userId);
  }
}
