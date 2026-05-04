import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'O email do usuário' })
  email: string;

  @ApiProperty({ example: 'João da Silva', description: 'O nome do usuário', required: false })
  name?: string;

  @ApiProperty({ example: 'senhaForte123', description: 'Senha inicial do usuário' })
  password: string;
}
