import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { UpdateCommentDto } from '../dtos/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createComment(postId: number, authorId: number, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post/Reporte não encontrado.');
    }

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        postId,
        authorId,
      },
      include: {
        author: { select: { id: true, name: true, profilePicture: true } }
      }
    });
  }

  async getCommentsByPost(postId: number) {
    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, name: true, profilePicture: true } }
      }
    });
  }

  async updateComment(commentId: number, authorId: number, dto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('Comentário não encontrado.');
    }
    if (comment.authorId !== authorId) {
      throw new ForbiddenException('Você só pode editar seus próprios comentários.');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content: dto.content },
      include: {
        author: { select: { id: true, name: true, profilePicture: true } }
      }
    });
  }

  async deleteComment(commentId: number, authorId: number) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('Comentário não encontrado.');
    }
    if (comment.authorId !== authorId) {
      throw new ForbiddenException('Você só pode excluir seus próprios comentários.');
    }

    await this.prisma.comment.delete({ where: { id: commentId } });
    return { success: true };
  }
}
