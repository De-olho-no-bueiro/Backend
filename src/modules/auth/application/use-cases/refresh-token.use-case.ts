import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ refreshToken }: RefreshTokenDto) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const user = await this.userRepository.findByRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const nextRefreshToken = randomUUID();
    await this.userRepository.update(user.id, { refreshToken: nextRefreshToken });

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: nextRefreshToken,
      userId: user.id,
      name: user.name,
    };
  }
}
