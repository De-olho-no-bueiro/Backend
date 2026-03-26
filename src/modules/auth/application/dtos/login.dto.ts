import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'O email do usuário' })
  email: string;

  @ApiProperty({ example: 'senhaForte123', description: 'A senha do usuário' })
  password: string;
}
