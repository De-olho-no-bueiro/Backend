import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  // Generics (Posts with location)
  async createReporte(data: any) {
    return this.prisma.post.create({
      data: {
        title: data.tipo,
        content: data.descricao,
        type: data.tipo,
        nivel: data.nivel,
        latitude: data.latitude,
        longitude: data.longitude,
        endereco: data.endereco,
        // medias: data.fotoUri ? [Buffer.from(data.fotoUri)] : [],
        published: true,
      },
    });
  }

  async getReportes() {
    return this.prisma.post.findMany({
      where: { type: 'alagamento' }, // O mobile chama de reporte o alagamento genérico por enquanto 
      orderBy: { createdAt: 'desc' },
    });
  }

  // Bueiros
  async createManhole(data: any) {
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
      },
    });

    return manhole;
  }

  async getManholes() {
    return this.prisma.manhole.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Flood Areas
  async createFloodArea(data: any) {
    const area = await this.prisma.area.create({
      data: {
        name: data.descricao || 'Área de Alagamento',
        latitude: data.coordinates.map((c: any) => c.latitude),
        longitude: data.coordinates.map((c: any) => c.longitude),
      },
    });

    await this.prisma.post.create({
      data: {
        title: 'Área de Alagamento',
        content: data.descricao,
        type: 'area',
        nivel: data.nivel,
        areaId: area.id,
        published: true,
      },
    });

    return area;
  }

  async getFloodAreas() {
    return this.prisma.area.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
