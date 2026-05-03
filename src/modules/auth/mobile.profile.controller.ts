import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import type { Request } from 'express';

import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { USER_REPOSITORY } from '../users/domain/repositories/user.repository.interface';
import type { IUserRepository } from '../users/domain/repositories/user.repository.interface';
import { MobileUpdateProfileDto } from '../users/application/dtos/mobile-update-profile.dto';
import { ChangePasswordDto } from '../users/application/dtos/change-password.dto';

@ApiTags('mobile-users')
@ApiBearerAuth()
@Controller('mobile/v1/users')
@UseGuards(JwtAuthGuard)
export class MobileProfileController {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Buscar perfil do usuário autenticado' })
  async me(@Req() req: Request & { user: { userId: number } }) {
    const user = await this.userRepository.findById(req.user.userId);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return this.serializeUser(user);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualizar perfil do usuário autenticado' })
  @ApiBody({ type: MobileUpdateProfileDto })
  async updateProfile(
    @Req() req: Request & { user: { userId: number } },
    @Body() dto: MobileUpdateProfileDto,
  ) {
    const user = await this.userRepository.findById(req.user.userId);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const nextName = dto.name?.trim();
    if (dto.name !== undefined && !nextName) {
      throw new BadRequestException('Nome inválido');
    }

    const nextProfilePicture =
      dto.removeProfilePicture
        ? null
        : dto.profilePictureBase64
          ? this.decodeBase64Image(dto.profilePictureBase64)
          : undefined;

    const updatedUser = await this.userRepository.update(user.id, {
      ...(nextName !== undefined ? { name: nextName } : {}),
      ...(nextProfilePicture !== undefined ? { profilePicture: nextProfilePicture } : {}),
    });

    return this.serializeUser(updatedUser);
  }

  @Post('me/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Alterar senha do usuário autenticado' })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(
    @Req() req: Request & { user: { userId: number } },
    @Body() dto: ChangePasswordDto,
  ) {
    const user = await this.userRepository.findById(req.user.userId);
    if (!user || !user.password) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    if (!dto.currentPassword || !dto.newPassword) {
      throw new BadRequestException('Senha atual e nova senha são obrigatórias');
    }

    if (dto.newPassword.length < 6) {
      throw new BadRequestException('A nova senha deve ter ao menos 6 caracteres');
    }

    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Senha atual inválida');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('A nova senha deve ser diferente da atual');
    }

    const password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.update(user.id, { password });

    return { ok: true };
  }

  private serializeUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture ?? null,
    };
  }

  private decodeBase64Image(value: string) {
    const cleaned = value.replace(/^data:[^;]+;base64,/, '').trim();
    const buffer = Buffer.from(cleaned, 'base64');

    if (!buffer.length) {
      throw new BadRequestException('Imagem inválida');
    }

    if (buffer.length > 5 * 1024 * 1024) {
      throw new BadRequestException('A imagem de perfil excede 5MB');
    }

    return buffer;
  }
}
