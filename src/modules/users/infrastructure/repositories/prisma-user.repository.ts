import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toPrismaBytes(value?: Buffer | null) {
    if (value === undefined) return undefined;
    if (value === null) return null;
    return new Uint8Array(value);
  }

  private toPrismaUserData(data: Partial<User>) {
    return {
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(data.password !== undefined ? { password: data.password } : {}),
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.resetPasswordToken !== undefined
        ? { resetPasswordToken: data.resetPasswordToken }
        : {}),
      ...(data.resetPasswordExpires !== undefined
        ? { resetPasswordExpires: data.resetPasswordExpires }
        : {}),
      ...(data.refreshToken !== undefined ? { refreshToken: data.refreshToken } : {}),
      ...(data.profilePicture !== undefined
        ? { profilePicture: this.toPrismaBytes(data.profilePicture) }
        : {}),
    };
  }

  private toPrismaCreateUserData(data: Partial<User>) {
    return {
      email: data.email!,
      password: data.password!,
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.resetPasswordToken !== undefined
        ? { resetPasswordToken: data.resetPasswordToken }
        : {}),
      ...(data.resetPasswordExpires !== undefined
        ? { resetPasswordExpires: data.resetPasswordExpires }
        : {}),
      ...(data.refreshToken !== undefined ? { refreshToken: data.refreshToken } : {}),
      ...(data.profilePicture !== undefined
        ? { profilePicture: this.toPrismaBytes(data.profilePicture) }
        : {}),
    };
  }

  private mapToDomain(user: any): User {
    return new User(
      user.id,
      user.email,
      user.name,
      user.password,
      user.resetPasswordToken,
      user.resetPasswordExpires,
      user.refreshToken,
      user.profilePicture,
    );
  }

  async create(data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.create({
      data: this.toPrismaCreateUserData(data),
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
      data: this.toPrismaUserData(data),
    });
    return this.mapToDomain(user);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
