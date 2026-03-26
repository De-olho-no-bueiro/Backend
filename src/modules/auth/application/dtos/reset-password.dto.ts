import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'token_de_reset', description: 'O token enviado por email' })
  token: string;

  @ApiProperty({ example: 'novaSenhaManeira123', description: 'A nova senha do usuário' })
  newPassword: string;
}
