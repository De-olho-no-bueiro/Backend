import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'João da Silva', description: 'O nome do usuário' })
  name: string;

  @ApiProperty({ example: 'user@example.com', description: 'O email do usuário' })
  email: string;

  @ApiProperty({ example: 'senhaForte123', description: 'A senha do usuário' })
  password: string;
}
