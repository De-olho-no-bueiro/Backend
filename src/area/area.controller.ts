import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@ApiTags('areas')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse()
@UseGuards(JwtAuthGuard)
@Controller('areas')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Post()
  @ApiOperation({ summary: 'Criar área (polígono)' })
  @ApiCreatedResponse({ description: 'Área criada' })
  create(@Body() dto: CreateAreaDto) {
    return this.areaService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar áreas' })
  @ApiOkResponse({ description: 'Lista de áreas' })
  findAll() {
    return this.areaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar área por id' })
  @ApiOkResponse({ description: 'Área' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.areaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar área' })
  @ApiOkResponse({ description: 'Área atualizada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAreaDto,
  ) {
    return this.areaService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover área' })
  @ApiOkResponse({ description: 'Área removida' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.areaService.remove(id);
  }
}
