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
import { CreateManholeDto } from './dto/create-manhole.dto';
import { UpdateManholeDto } from './dto/update-manhole.dto';
import { ManholeService } from './manhole.service';

@ApiTags('manholes')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse()
@UseGuards(JwtAuthGuard)
@Controller('manholes')
export class ManholeController {
  constructor(private readonly manholeService: ManholeService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar bueiro' })
  @ApiCreatedResponse({ description: 'Bueiro criado' })
  create(@Body() dto: CreateManholeDto) {
    return this.manholeService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar bueiros' })
  @ApiOkResponse({ description: 'Lista de bueiros' })
  findAll() {
    return this.manholeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar bueiro por id' })
  @ApiOkResponse({ description: 'Bueiro' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.manholeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar bueiro' })
  @ApiOkResponse({ description: 'Bueiro atualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateManholeDto,
  ) {
    return this.manholeService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover bueiro' })
  @ApiOkResponse({ description: 'Bueiro removido' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.manholeService.remove(id);
  }
}
