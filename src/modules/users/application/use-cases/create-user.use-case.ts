import { Injectable, Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { CreateUserDto } from '../dtos/create-user.dto';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(data: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.userRepository.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
    });
  }
}
