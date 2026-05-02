import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ refreshToken }: RefreshTokenDto) {
    if (!refreshToken) {
      return { success: true };
    }

    const user = await this.userRepository.findByRefreshToken(refreshToken);
    if (!user) {
      return { success: true };
    }

    await this.userRepository.update(user.id, { refreshToken: null });
    return { success: true };
  }
}
