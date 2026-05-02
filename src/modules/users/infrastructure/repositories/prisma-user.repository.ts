import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(user: any): User {
    return new User(
      user.id,
      user.email,
      user.name,
      user.password,
      user.resetPasswordToken,
      user.resetPasswordExpires,
      user.refreshToken,
    );
  }

  async create(data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email!,
        password: data.password!,
        name: data.name,
      },
    });
    return this.mapToDomain(user);
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return this.mapToDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    return this.mapToDomain(user);
  }

  async findByResetToken(token: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { resetPasswordToken: token },
    });
    if (!user) return null;
    return this.mapToDomain(user);
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { refreshToken },
    });
    if (!user) return null;
    return this.mapToDomain(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map((u) => this.mapToDomain(u));
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    return this.mapToDomain(user);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
