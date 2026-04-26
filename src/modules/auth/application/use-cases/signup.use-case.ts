import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignupDto } from '../dtos/signup.dto';

@Injectable()
export class SignupUseCase {
  private readonly logger = new Logger(SignupUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(data: SignupDto) {
    this.logger.log(`Signup attempt for email: ${data.email}`);

    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      this.logger.warn(`Signup failed: email ${data.email} already exists`);
      throw new BadRequestException('Email já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
    });

    this.logger.log(`User ${data.email} created successfully with id ${user.id}`);
    const { password, ...result } = user;
    return result;
  }
}
