import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Post as PostModel, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePostDto } from './dto/create-post.dto';
import type { UpdatePostDto } from './dto/update-post.dto';

const postListSelect = {
  id: true,
  title: true,
  content: true,
  published: true,
  createdAt: true,
  updatedAt: true,
  authorId: true,
  manholeId: true,
  areaId: true,
} satisfies Prisma.PostSelect;

export type PostListItem = Prisma.PostGetPayload<{
  select: typeof postListSelect;
}>;

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  private mediasFromBase64(medias?: string[]): Buffer[] {
    if (!medias?.length) {
      return [];
    }
    return medias.map((raw, i) => {
      const s = raw.replace(/^data:[^;]+;base64,/, '');
      try {
        return Buffer.from(s, 'base64');
      } catch {
        throw new BadRequestException(`medias[${i}] não é Base64 válido`);
      }
    });
  }

  private toResponse(post: PostModel) {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      published: post.published,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorId: post.authorId,
      manholeId: post.manholeId,
      areaId: post.areaId,
      mediasBase64: post.medias.map((b) => Buffer.from(b).toString('base64')),
    };
  }

  private async assertForeignKeys(
    manholeId?: number | null,
    areaId?: number | null,
  ) {
    if (manholeId != null) {
      const m = await this.prisma.manhole.findUnique({
        where: { id: manholeId },
      });
      if (!m) {
        throw new BadRequestException('manholeId inválido');
      }
    }
    if (areaId != null) {
      const a = await this.prisma.area.findUnique({ where: { id: areaId } });
      if (!a) {
        throw new BadRequestException('areaId inválido');
      }
    }
  }

  async create(authorId: number, dto: CreatePostDto) {
    await this.assertForeignKeys(dto.manholeId, dto.areaId);
    const medias = this.mediasFromBase64(dto.medias);
    const post = await this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        medias: medias as Prisma.PostUncheckedCreateInput['medias'],
        published: dto.published ?? false,
        authorId,
        manholeId: dto.manholeId,
        areaId: dto.areaId,
      },
    });
    return this.toResponse(post);
  }

  findPublished(): Promise<PostListItem[]> {
    return this.prisma.post.findMany({
      where: { published: true },
      select: postListSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  findMine(authorId: number): Promise<PostListItem[]> {
    return this.prisma.post.findMany({
      where: { authorId },
      select: postListSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, viewerId?: number) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }
    if (!post.published && post.authorId !== viewerId) {
      throw new NotFoundException('Post não encontrado');
    }
    return this.toResponse(post);
  }

  async update(id: number, authorId: number, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }
    if (post.authorId !== authorId) {
      throw new ForbiddenException('Você não pode editar este post');
    }
    await this.assertForeignKeys(
      dto.manholeId !== undefined ? dto.manholeId : post.manholeId,
      dto.areaId !== undefined ? dto.areaId : post.areaId,
    );
    const data: Prisma.PostUncheckedUpdateInput = {};
    if (dto.title !== undefined) {
      data.title = dto.title;
    }
    if (dto.content !== undefined) {
      data.content = dto.content;
    }
    if (dto.published !== undefined) {
      data.published = dto.published;
    }
    if (dto.manholeId !== undefined) {
      data.manholeId = dto.manholeId;
    }
    if (dto.areaId !== undefined) {
      data.areaId = dto.areaId;
    }
    if (dto.medias !== undefined) {
      data.medias = this.mediasFromBase64(
        dto.medias,
      ) as Prisma.PostUncheckedUpdateInput['medias'];
    }
    const updated = await this.prisma.post.update({
      where: { id },
      data,
    });
    return this.toResponse(updated);
  }

  async remove(id: number, authorId: number) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }
    if (post.authorId !== authorId) {
      throw new ForbiddenException('Você não pode remover este post');
    }
    await this.prisma.post.delete({ where: { id } });
    return { id, removed: true };
  }
}
