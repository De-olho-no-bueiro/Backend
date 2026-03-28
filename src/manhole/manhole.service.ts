import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateManholeDto } from './dto/create-manhole.dto';
import type { UpdateManholeDto } from './dto/update-manhole.dto';

@Injectable()
export class ManholeService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateManholeDto) {
    return this.prisma.manhole.create({ data: dto });
  }

  findAll() {
    return this.prisma.manhole.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    const manhole = await this.prisma.manhole.findUnique({ where: { id } });
    if (!manhole) {
      throw new NotFoundException('Bueiro não encontrado');
    }
    return manhole;
  }

  async update(id: number, dto: UpdateManholeDto) {
    await this.findOne(id);
    return this.prisma.manhole.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.manhole.delete({ where: { id } });
  }
}
