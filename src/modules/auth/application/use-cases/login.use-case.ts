import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { LoginDto } from '../dtos/login.dto';

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(data: LoginDto) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      this.logger.warn(`Login failed: user not found for email ${data.email}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.password) {
      this.logger.warn(`Login failed: user ${data.email} has no password set`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Login failed: invalid password for user ${data.email}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    this.logger.log(`User ${data.email} logged in successfully`);
    const payload = { sub: user.id, email: user.email };
    const refreshToken = randomUUID();

    await this.userRepository.update(user.id, { refreshToken });

    this.logger.debug(
      `Issuing tokens for user ${user.email}: accessToken=yes refreshToken=${refreshToken.slice(0, 8)}...`,
    );

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
      userId: user.id,
      name: user.name,
      profilePicture: user.profilePicture ?? null,
    };
  }
}
