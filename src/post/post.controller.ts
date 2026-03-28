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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';
import type { User } from '@prisma/client';

@ApiTags('posts')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse()
@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiOperation({ summary: 'Criar post' })
  @ApiCreatedResponse({ description: 'Post com mídias em Base64' })
  create(@CurrentUser() user: User, @Body() dto: CreatePostDto) {
    return this.postService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar posts publicados' })
  @ApiOkResponse({ description: 'Sem campo de mídia (lista leve)' })
  findPublished() {
    return this.postService.findPublished();
  }

  @Get('me')
  @ApiOperation({ summary: 'Meus posts (todos os estados)' })
  @ApiOkResponse({ description: 'Lista sem mídia' })
  findMine(@CurrentUser() user: User) {
    return this.postService.findMine(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do post (com mídias Base64)' })
  @ApiOkResponse({ description: 'Post completo' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.postService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar post (autor)' })
  @ApiOkResponse({ description: 'Post atualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover post (autor)' })
  @ApiOkResponse({ description: 'Removido' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.postService.remove(id, user.id);
  }
}
