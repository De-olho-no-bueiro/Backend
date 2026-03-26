import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'O email do usuário', required: false })
  email?: string;

  @ApiProperty({ example: 'João da Silva', description: 'O nome do usuário', required: false })
  name?: string;
}
