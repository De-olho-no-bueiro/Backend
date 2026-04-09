import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateCommentDto } from '../dtos/create-comment.dto';

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
}
