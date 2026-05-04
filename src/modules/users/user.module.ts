import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { UserController } from './infrastructure/http/user.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { FindUserUseCase, ListUsersUseCase } from './application/use-cases/find-user.use-case';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    FindUserUseCase,
    ListUsersUseCase,
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
