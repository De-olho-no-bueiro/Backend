import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './types/jwt-payload.interface';
import type { User } from '@prisma/client';

export type PublicUser = Omit<User, 'password' | 'profilePicture'> & {
  profilePictureBase64: string | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  toPublicUser(user: User): PublicUser {
    const { password, profilePicture, ...rest } = user;
    return {
      ...rest,
      profilePictureBase64: profilePicture
        ? Buffer.from(profilePicture).toString('base64')
        : null,
    };
  }

  private signToken(user: Pick<User, 'id' | 'email'>): string {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return this.jwt.sign(payload);
  }

  async register(dto: RegisterDto) {
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: passwordHash,
          name: dto.name,
          cpf: dto.cpf,
        },
      });
      const accessToken = this.signToken(user);
      return {
        accessToken,
        user: this.toPublicUser(user),
      };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        const fields = e.meta?.target as string[] | undefined;
        if (fields?.includes('email')) {
          throw new ConflictException('E-mail já cadastrado');
        }
        if (fields?.includes('cpf')) {
          throw new ConflictException('CPF já cadastrado');
        }
        throw new ConflictException('Dados já cadastrados');
      }
      throw e;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const ok = await argon2.verify(user.password, dto.password);
    if (!ok) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const accessToken = this.signToken(user);
    return {
      accessToken,
      user: this.toPublicUser(user),
    };
  }

  getProfile(user: User): PublicUser {
    return this.toPublicUser(user);
  }
}
