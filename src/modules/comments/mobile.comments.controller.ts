import { Controller, Delete, Get, Patch, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './application/services/comments.service';
import { CreateCommentDto } from './application/dtos/create-comment.dto';
import { UpdateCommentDto } from './application/dtos/update-comment.dto';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';

@ApiTags('mobile-comments')
@ApiBearerAuth()
@Controller('mobile/v1/comments')
export class MobileCommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':postId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Adicionar comentário em um reporte/bueiro/area (Passar ID do Post)' })
  async createComment(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: any
  ) {
    return this.commentsService.createComment(Number(postId), req.user.userId, dto);
  }

  @Get(':postId')
  @ApiOperation({ summary: 'Recuperar todos os comentários de um Post' })
  async getComments(@Param('postId') postId: string) {
    return this.commentsService.getCommentsByPost(Number(postId));
  }

  @Patch(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Editar comentário próprio' })
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: any
  ) {
    return this.commentsService.updateComment(Number(commentId), req.user.userId, dto);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Excluir comentário próprio' })
  async deleteComment(@Param('commentId') commentId: string, @Req() req: any) {
    return this.commentsService.deleteComment(Number(commentId), req.user.userId);
  }
}
