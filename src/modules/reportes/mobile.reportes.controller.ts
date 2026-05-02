import { Controller, Get, Post, Body, UseGuards, Req, Logger, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ReportesService } from './application/services/reportes.service';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { VerifyReporteDto } from './application/dtos/verify-reporte.dto';

@ApiTags('mobile-reportes')
@ApiBearerAuth()
@Controller('mobile/v1/reportes')
export class MobileReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar Reportes/Alagamentos simples (Mobile)' })
  async getReportes(@Req() req: any) {
    return this.reportesService.getReportes(req.user.userId);
  }

  @Get('history/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Histórico do usuário autenticado, incluindo posts inativos' })
  async getMyHistory(@Req() req: any) {
    return this.reportesService.getMyHistory(req.user.userId);
  }

  @Get(':postId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Detalhar um post por ID' })
  async getPostById(@Param('postId') postId: string, @Req() req: any) {
    return this.reportesService.getPostById(Number(postId), req.user.userId);
  }

  @Post(':postId/like')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Alternar curtida em um post' })
  async toggleLike(@Param('postId') postId: string, @Req() req: any) {
    return this.reportesService.toggleLike(Number(postId), req.user.userId);
  }

  @Post(':postId/verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Confirmar se incidente ainda acontece' })
  async verifyPost(@Param('postId') postId: string, @Body() dto: VerifyReporteDto) {
    return this.reportesService.verifyPost(Number(postId), dto.isStillHappening);
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar Bueiros (Mobile)' })
  async getManholes(@Req() req: any) {
    return this.reportesService.getManholes(req.user.userId);
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
  private readonly logger = new Logger(MobileFloodAreasController.name);

  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar Áreas de Alagamento (Mobile)' })
  async getFloodAreas(@Req() req: any) {
    return this.reportesService.getFloodAreas(req.user.userId);
  }

  @Get('auth-test')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Testar autenticação Bearer do mobile' })
  async authTest(@Req() req: any) {
    return {
      ok: true,
      userId: req.user.userId,
      email: req.user.email,
    };
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
    this.logger.debug(
      `Creating flood area request: userId=${req.user?.userId} coordinates=${Array.isArray(createDto?.coordinates) ? createDto.coordinates.length : 0} nivel=${createDto?.nivel ?? 'n/a'}`,
    );
    return this.reportesService.createFloodArea(createDto, req.user.userId);
  }
}
