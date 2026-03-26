import { Injectable, BadRequestException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignupDto } from '../dtos/signup.dto';

@Injectable()
export class SignupUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(data: SignupDto) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('Email já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
    });

    // Removendo dados sensíveis do retorno
    const { password, ...result } = user;
    return result;
  }
}
