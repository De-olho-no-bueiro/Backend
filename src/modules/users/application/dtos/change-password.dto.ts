import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'senhaAtual123' })
  currentPassword: string;

  @ApiProperty({ example: 'novaSenhaSuperSegura123' })
  newPassword: string;
}
