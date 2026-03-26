import { Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { Inject } from '@nestjs/common';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import * as crypto from 'crypto';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(data: ForgotPasswordDto) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      // Retornar void sem erro para evitar enumeração de emails
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date();
    resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1); // 1 hora de validade

    await this.userRepository.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires, // Note: The repository update and domain entity must support these fields
    });

    console.log(`[Mock Email] Enviar email para ${user.email} com token: ${resetToken}`);
    // Futuro: Serviço de e-mail aqui
  }
}
