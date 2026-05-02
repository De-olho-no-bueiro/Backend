import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class ReportesService {
  private readonly logger = new Logger(ReportesService.name);

  constructor(private readonly prisma: PrismaService) {}

  private parseMedias(midias?: string[]): any[] {
    if (!midias || !Array.isArray(midias)) return [];
    return midias.slice(0, 6).map((base64String) => {
       // Se o mobile mandar data:image/jpeg;base64, tiramos o cabeçalho. 
       const cleanBase64 = base64String.replace(/^data:([A-Za-z-+/]+);base64,/, '');
       return Buffer.from(cleanBase64, 'base64') as any;
    });
  }

  private getPostInclude(viewerId?: number) {
    return {
      author: { select: { id: true, name: true, profilePicture: true } },
      ...(viewerId
        ? { likes: { where: { userId: viewerId }, select: { id: true } } }
        : {}),
      _count: { select: { likes: true } },
      area: true,
      manhole: true,
    };
  }

  private serializePost(post: any) {
    const likes = Array.isArray(post.likes) ? post.likes : [];
    const likeCount = post._count?.likes ?? 0;

    return {
      ...post,
      likeCount,
      likedByMe: likes.length > 0,
      likes: undefined,
      _count: undefined,
    };
  }

  private isLegacySchemaError(error: any) {
    return error?.code === 'P2021' || error?.code === 'P2022';
  }

  private serializeLegacyPost(post: any) {
    return {
      ...post,
      likeCount: 0,
      likedByMe: false,
      isActive: true,
      negativeReportsCount: 0,
    };
  }

  // Generics (Posts with location)
  async createReporte(data: any, authorId: number) {
    this.logger.log(`Creating reporte for author ${authorId}: ${JSON.stringify(data)}`);
    return this.prisma.post.create({
      data: {
        title: data.tipo,
        content: data.descricao,
        type: data.tipo,
        nivel: data.nivel,
        latitude: data.latitude,
        longitude: data.longitude,
        endereco: data.endereco,
        medias: this.parseMedias(data.midias),
        published: true,
        authorId,
      },
    });
  }

  async getReportes(viewerId?: number) {
    try {
      const reportes = await this.prisma.post.findMany({
        where: { type: 'alagamento', isActive: true }, // O mobile chama de reporte o alagamento genérico por enquanto 
        orderBy: { createdAt: 'desc' },
        include: this.getPostInclude(viewerId),
      });

      return reportes.map((post) => this.serializePost(post));
    } catch (error) {
      if (!this.isLegacySchemaError(error)) throw error;
      this.logger.warn('Legacy schema detected in getReportes. Falling back without likes/isActive.');
      const reportes = await this.prisma.post.findMany({
        where: { type: 'alagamento' },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, name: true, profilePicture: true } } },
      });
      return reportes.map((post) => this.serializeLegacyPost(post));
    }
  }

  // Bueiros
  async createManhole(data: any, authorId: number) {
    const manhole = await this.prisma.manhole.create({
      data: {
        name: data.descricao || 'Bueiro Desconhecido',
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });

    // We also link it to a Post to hold the descriptive content & media
    await this.prisma.post.create({
      data: {
        title: 'Reporte de Bueiro',
        content: data.descricao,
        type: 'bueiro',
        latitude: data.latitude,
        longitude: data.longitude,
        endereco: data.endereco,
        manholeId: manhole.id,
        published: true,
        authorId,
        medias: this.parseMedias(data.midias),
      },
    });

    return manhole;
  }

  async getManholes(viewerId?: number) {
    try {
      const manholes = await this.prisma.manhole.findMany({
        where: { posts: { some: { isActive: true } } },
        orderBy: { createdAt: 'desc' },
        include: {
          posts: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: this.getPostInclude(viewerId),
          },
        },
      });

      return manholes.map((manhole) => ({
        ...manhole,
        posts: manhole.posts.map((post) => this.serializePost(post)),
      }));
    } catch (error) {
      if (!this.isLegacySchemaError(error)) throw error;
      this.logger.warn('Legacy schema detected in getManholes. Falling back without likes/isActive.');
      const manholes = await this.prisma.manhole.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          posts: {
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { id: true, name: true, profilePicture: true } } },
          },
        },
      });

      return manholes.map((manhole) => ({
        ...manhole,
        posts: manhole.posts.slice(0, 1).map((post) => this.serializeLegacyPost(post)),
      }));
    }
  }

  // Flood Areas
  async createFloodArea(data: any, authorId: number) {
    this.logger.log(`Creating flood area for author ${authorId}: ${JSON.stringify(data)}`);

    if (!data.coordinates || !Array.isArray(data.coordinates) || data.coordinates.length < 3) {
      this.logger.error(`Invalid coordinates for flood area: ${JSON.stringify(data.coordinates)}`);
      throw new Error('Área de alagamento requer pelo menos 3 coordenadas');
    }

    const area = await this.prisma.area.create({
      data: {
        name: data.descricao || 'Área de Alagamento',
        nivel: data.nivel || 'medio',
        latitude: data.coordinates.map((c: any) => c.latitude),
        longitude: data.coordinates.map((c: any) => c.longitude),
      },
    });

    this.logger.log(`Created area with id ${area.id}`);

    await this.prisma.post.create({
      data: {
        title: 'Área de Alagamento',
        content: data.descricao,
        type: 'area',
        nivel: data.nivel || 'medio',
        latitude: data.coordinates[0]?.latitude,
        longitude: data.coordinates[0]?.longitude,
        endereco: data.endereco,
        areaId: area.id,
        published: true,
        authorId,
        medias: this.parseMedias(data.midias),
      },
    });

    return area;
  }

  async getFloodAreas(viewerId?: number) {
    try {
      const areas = await this.prisma.area.findMany({
        where: { posts: { some: { isActive: true } } },
        orderBy: { createdAt: 'desc' },
        include: {
          posts: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: this.getPostInclude(viewerId),
          },
        },
      });

      return areas.map((area) => ({
        ...area,
        posts: area.posts.map((post) => this.serializePost(post)),
      }));
    } catch (error) {
      if (!this.isLegacySchemaError(error)) throw error;
      this.logger.warn('Legacy schema detected in getFloodAreas. Falling back without likes/isActive.');
      const areas = await this.prisma.area.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          posts: {
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { id: true, name: true, profilePicture: true } } },
          },
        },
      });

      return areas.map((area) => ({
        ...area,
        posts: area.posts.slice(0, 1).map((post) => this.serializeLegacyPost(post)),
      }));
    }
  }

  async getPostById(postId: number, viewerId?: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: this.getPostInclude(viewerId),
    });

    if (!post) {
      throw new NotFoundException('Post não encontrado.');
    }

    return this.serializePost(post);
  }

  async getMyHistory(authorId: number) {
    const posts = await this.prisma.post.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
      include: this.getPostInclude(authorId),
    });

    return posts.map((post) => this.serializePost(post));
  }

  async toggleLike(postId: number, userId: number) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post não encontrado.');
    }

    const existing = await this.prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.like.create({ data: { userId, postId } });
    }

    const likeCount = await this.prisma.like.count({ where: { postId } });
    return {
      likedByMe: !existing,
      likeCount,
    };
  }

  async verifyPost(postId: number, isStillHappening: boolean) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post não encontrado.');
    }

    if (isStillHappening) {
      return post;
    }

    const nextNegativeReportsCount = post.negativeReportsCount + 1;

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        negativeReportsCount: nextNegativeReportsCount,
        isActive: nextNegativeReportsCount >= 3 ? false : post.isActive,
      },
    });
  }

  async expireOldIncidents() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 3);

    return this.prisma.post.updateMany({
      where: {
        isActive: true,
        createdAt: { lt: cutoff },
      },
      data: {
        isActive: false,
      },
    });
  }
}
