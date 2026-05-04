import { Controller, Post, Get, Patch, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { FindUserUseCase, ListUsersUseCase } from '../../application/use-cases/find-user.use-case';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { AdminEmailGuard } from '../../../auth/infrastructure/guards/admin-email.guard';
import { User } from '../../domain/entities/user.entity';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, AdminEmailGuard)
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly findUserUseCase: FindUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  private sanitizeUser(user: User | null) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      profilePicture: user.profilePicture ?? null,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiResponse({ status: 201, description: 'O usuário foi criado com sucesso.' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.sanitizeUser(await this.createUserUseCase.execute(createUserDto));
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  async findAll() {
    const users = await this.listUsersUseCase.execute();
    return users.map((user) => this.sanitizeUser(user));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário via ID' })
  async findOne(@Param('id') id: string) {
    return this.sanitizeUser(await this.findUserUseCase.execute(+id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.sanitizeUser(await this.updateUserUseCase.execute(+id, updateUserDto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar usuário' })
  async remove(@Param('id') id: string) {
    return this.deleteUserUseCase.execute(+id);
  }
}
