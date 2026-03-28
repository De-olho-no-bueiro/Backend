import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateAreaDto } from './dto/create-area.dto';
import type { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreaService {
  constructor(private readonly prisma: PrismaService) {}

  private assertPolygon(dto: { latitude: number[]; longitude: number[] }) {
    if (dto.latitude.length !== dto.longitude.length) {
      throw new BadRequestException(
        'latitude e longitude devem ter o mesmo número de vértices',
      );
    }
  }

  create(dto: CreateAreaDto) {
    this.assertPolygon(dto);
    return this.prisma.area.create({ data: dto });
  }

  findAll() {
    return this.prisma.area.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    const area = await this.prisma.area.findUnique({ where: { id } });
    if (!area) {
      throw new NotFoundException('Área não encontrada');
    }
    return area;
  }

  async update(id: number, dto: UpdateAreaDto) {
    await this.findOne(id);
    const lat = dto.latitude;
    const lng = dto.longitude;
    if (lat !== undefined && lng !== undefined) {
      this.assertPolygon({
        latitude: lat,
        longitude: lng,
      });
    } else if (lat !== undefined || lng !== undefined) {
      throw new BadRequestException(
        'Atualize latitude e longitude juntos para manter o polígono consistente',
      );
    }
    return this.prisma.area.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.area.delete({ where: { id } });
  }
}
