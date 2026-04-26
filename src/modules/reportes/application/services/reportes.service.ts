import { Injectable, Logger } from '@nestjs/common';
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

  async getReportes() {
    return this.prisma.post.findMany({
      where: { type: 'alagamento' }, // O mobile chama de reporte o alagamento genérico por enquanto 
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, name: true, profilePicture: true } } }
    });
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
        manholeId: manhole.id,
        published: true,
        authorId,
        medias: this.parseMedias(data.midias),
      },
    });

    return manhole;
  }

  async getManholes() {
    return this.prisma.manhole.findMany({
      orderBy: { createdAt: 'desc' },
      include: { posts: { include: { author: { select: { id: true, name: true, profilePicture: true } } } } }
    });
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
        areaId: area.id,
        published: true,
        authorId,
        medias: this.parseMedias(data.midias),
      },
    });

    return area;
  }

  async getFloodAreas() {
    return this.prisma.area.findMany({
      orderBy: { createdAt: 'desc' },
      include: { posts: { include: { author: { select: { id: true, name: true, profilePicture: true } } } } }
    });
  }
}
