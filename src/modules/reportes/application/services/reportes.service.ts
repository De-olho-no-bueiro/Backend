import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class ReportesService {
  private readonly logger = new Logger(ReportesService.name);

  constructor(private readonly prisma: PrismaService) {}

  private get postModel() {
    return this.prisma.post as any;
  }

  private get likeModel() {
    return this.prisma.like as any;
  }

  private get manholeModel() {
    return this.prisma.manhole as any;
  }

  private get areaModel() {
    return this.prisma.area as any;
  }

  private get postMediaModel() {
    return (this.prisma as any).postMedia;
  }

  private normalizePostType(type?: string | null): string | null {
    if (typeof type !== 'string') return null;

    const normalized = type.trim().toLowerCase();
    if (!normalized) return null;

    if (normalized.includes('bueiro')) return 'bueiro';
    if (normalized.includes('alag')) return 'alagamento';
    if (normalized.includes('area')) return 'area';

    return normalized;
  }

  private parseMedias(midias?: string[]): any[] {
    if (!midias || !Array.isArray(midias)) return [];
    return midias.slice(0, 6).map((base64String) => {
       // Se o mobile mandar data:image/jpeg;base64, tiramos o cabeçalho. 
       const cleanBase64 = base64String.replace(/^data:([A-Za-z-+/]+);base64,/, '');
       return Buffer.from(cleanBase64, 'base64') as any;
    });
  }

  private parseLegacyBufferToDataUrl(mediaObj: any): string {
    if (typeof mediaObj === 'string') {
      return mediaObj.startsWith('data:') ? mediaObj : `data:image/jpeg;base64,${mediaObj}`;
    }

    if (Buffer.isBuffer(mediaObj)) {
      return `data:image/jpeg;base64,${mediaObj.toString('base64')}`;
    }

    if (mediaObj && mediaObj.type === 'Buffer' && Array.isArray(mediaObj.data)) {
      return `data:image/jpeg;base64,${Buffer.from(mediaObj.data).toString('base64')}`;
    }

    return '';
  }

  private normalizeMediaRecords(post: any) {
    const structuredMedia = Array.isArray(post.media)
      ? post.media.map((item: any) => ({
          id: item.id,
          storageKey: item.storageKey,
          url: item.url,
          mimeType: item.mimeType,
          sizeBytes: item.sizeBytes,
          width: item.width ?? null,
          height: item.height ?? null,
          position: item.position ?? 0,
        }))
      : [];

    if (structuredMedia.length > 0) {
      return {
        media: structuredMedia,
        medias: structuredMedia.map((item: any) => item.url),
        fotoUrl: structuredMedia[0]?.url ?? null,
      };
    }

    const legacyMedia = Array.isArray(post.medias)
      ? post.medias.map((item: any) => this.parseLegacyBufferToDataUrl(item)).filter(Boolean)
      : [];

    return {
      media: legacyMedia.map((url: string, index: number) => ({
        id: `legacy-${post.id}-${index}`,
        storageKey: null,
        url,
        mimeType: 'image/jpeg',
        sizeBytes: 0,
        width: null,
        height: null,
        position: index,
      })),
      medias: legacyMedia,
      fotoUrl: legacyMedia[0] ?? null,
    };
  }

  private extractStructuredMedia(authorId: number, data: any) {
    if (!Array.isArray(data?.mediaUploads)) return [];

    const allowedPrefix = `mobile/posts/${authorId}/`;

    return data.mediaUploads
      .slice(0, 6)
      .filter(
        (item: any) =>
          item?.storageKey &&
          item?.url &&
          item?.mimeType &&
          item?.sizeBytes &&
          String(item.storageKey).startsWith(allowedPrefix),
      )
      .map((item: any, index: number) => ({
        storageKey: String(item.storageKey),
        url: String(item.url),
        mimeType: String(item.mimeType),
        sizeBytes: Number(item.sizeBytes),
        width: item.width != null ? Number(item.width) : null,
        height: item.height != null ? Number(item.height) : null,
        position: index,
      }));
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
      media: { orderBy: { position: 'asc' } },
    };
  }

  private serializePost(post: any) {
    const likes = Array.isArray(post.likes) ? post.likes : [];
    const likeCount = post._count?.likes ?? 0;
    const mediaData = this.normalizeMediaRecords(post);

    return {
      ...post,
      likeCount,
      likedByMe: likes.length > 0,
      media: mediaData.media,
      medias: mediaData.medias,
      fotoUrl: mediaData.fotoUrl,
      likes: undefined,
      _count: undefined,
    };
  }

  private isLegacySchemaError(error: any) {
    const message = typeof error?.message === 'string' ? error.message : '';

    return (
      error?.code === 'P2021' ||
      error?.code === 'P2022' ||
      (error?.name === 'PrismaClientValidationError' &&
        (message.includes('Unknown field `media`') ||
          message.includes('Unknown field `isActive`') ||
          message.includes('Unknown argument `media`')))
    );
  }

  private serializeLegacyPost(post: any) {
    const mediaData = this.normalizeMediaRecords(post);

    return {
      ...post,
      likeCount: 0,
      likedByMe: false,
      isActive: true,
      negativeReportsCount: 0,
      media: mediaData.media,
      medias: mediaData.medias,
      fotoUrl: mediaData.fotoUrl,
    };
  }

  private async attachStructuredMedia(postId: number, authorId: number, data: any) {
    const structuredMedia = this.extractStructuredMedia(authorId, data);
    if (structuredMedia.length === 0 || !this.postMediaModel) {
      return;
    }

    await this.postMediaModel.createMany({
      data: structuredMedia.map((item: any) => ({
        ...item,
        postId,
      })),
    });
  }

  // Generics (Posts with location)
  async createReporte(data: any, authorId: number) {
    this.logger.log(`Creating reporte for author ${authorId}: ${JSON.stringify(data)}`);
    const post = await this.postModel.create({
      data: {
        title: data.tipo,
        content: data.descricao,
        type: this.normalizePostType(data.tipo) ?? 'alagamento',
        nivel: data.nivel,
        latitude: data.latitude,
        longitude: data.longitude,
        endereco: data.endereco,
        medias: this.parseMedias(data.midias),
        published: true,
        authorId,
      },
    });

    await this.attachStructuredMedia(post.id, authorId, data);
    return post;
  }

  async getReportes(viewerId?: number) {
    try {
      const reportes = await this.postModel.findMany({
        where: {
          isActive: true,
          areaId: null,
          manholeId: null,
          OR: [
            { type: 'alagamento' },
            { type: null },
            { type: '' },
          ],
        }, // Inclui incidentes legados sem type normalizado.
        orderBy: { createdAt: 'desc' },
        include: this.getPostInclude(viewerId),
      });

      return reportes.map((post) => this.serializePost(post));
    } catch (error) {
      if (!this.isLegacySchemaError(error)) throw error;
      this.logger.warn('Legacy schema detected in getReportes. Falling back without likes/isActive.');
      const reportes = await this.postModel.findMany({
        where: {
          areaId: null,
          manholeId: null,
          OR: [
            { type: 'alagamento' },
            { type: null },
            { type: '' },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, name: true, profilePicture: true } } },
      });
      return reportes.map((post) => this.serializeLegacyPost(post));
    }
  }

  async getPublicMapData() {
    const [reportes, manholes, areas] = await Promise.all([
      this.getReportes(),
      this.getManholes(),
      this.getFloodAreas(),
    ]);

    return {
      reportes,
      manholes,
      areas,
    };
  }

  // Bueiros
  async createManhole(data: any, authorId: number) {
    const manhole = await this.manholeModel.create({
      data: {
        name: data.descricao || 'Bueiro Desconhecido',
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });

    // We also link it to a Post to hold the descriptive content & media
    const post = await this.postModel.create({
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

    await this.attachStructuredMedia(post.id, authorId, data);

    return manhole;
  }

  async getManholes(viewerId?: number) {
    try {
      const manholes = await this.manholeModel.findMany({
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
      const manholes = await this.manholeModel.findMany({
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

    const area = await this.areaModel.create({
      data: {
        name: data.descricao || 'Área de Alagamento',
        nivel: data.nivel || 'medio',
        latitude: data.coordinates.map((c: any) => c.latitude),
        longitude: data.coordinates.map((c: any) => c.longitude),
      },
    });

    this.logger.log(`Created area with id ${area.id}`);

    const post = await this.postModel.create({
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

    await this.attachStructuredMedia(post.id, authorId, data);

    return area;
  }

  async getFloodAreas(viewerId?: number) {
    try {
      const areas = await this.areaModel.findMany({
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
      const areas = await this.areaModel.findMany({
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
    try {
      const post = await this.postModel.findUnique({
        where: { id: postId },
        include: this.getPostInclude(viewerId),
      });

      if (!post) {
        throw new NotFoundException('Post não encontrado.');
      }

      return this.serializePost(post);
    } catch (error) {
      if (!this.isLegacySchemaError(error)) throw error;
      const post = await this.postModel.findUnique({
        where: { id: postId },
        include: { author: { select: { id: true, name: true, profilePicture: true } } },
      });

      if (!post) {
        throw new NotFoundException('Post não encontrado.');
      }

      return this.serializeLegacyPost(post);
    }
  }

  async getMyHistory(authorId: number) {
    try {
      const posts = await this.postModel.findMany({
        where: { authorId },
        orderBy: { createdAt: 'desc' },
        include: this.getPostInclude(authorId),
      });

      return posts.map((post: any) => this.serializePost(post));
    } catch (error) {
      if (!this.isLegacySchemaError(error)) throw error;
      const posts = await this.postModel.findMany({
        where: { authorId },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, name: true, profilePicture: true } } },
      });

      return posts.map((post: any) => this.serializeLegacyPost(post));
    }
  }

  async toggleLike(postId: number, userId: number) {
    const post = await this.postModel.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post não encontrado.');
    }

    const existing = await this.likeModel.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await this.likeModel.delete({ where: { id: existing.id } });
    } else {
      await this.likeModel.create({ data: { userId, postId } });
    }

    const likeCount = await this.likeModel.count({ where: { postId } });
    return {
      likedByMe: !existing,
      likeCount,
    };
  }

  async verifyPost(postId: number, isStillHappening: boolean) {
    const post = await this.postModel.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post não encontrado.');
    }

    if (isStillHappening) {
      return post;
    }

    const nextNegativeReportsCount = post.negativeReportsCount + 1;

    return this.postModel.update({
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

    return this.postModel.updateMany({
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
