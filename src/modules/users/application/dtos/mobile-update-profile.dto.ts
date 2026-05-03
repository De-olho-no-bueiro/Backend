import { ApiProperty } from '@nestjs/swagger';

export class MobileUpdateProfileDto {
  @ApiProperty({ example: 'João da Silva', required: false })
  name?: string;

  @ApiProperty({
    example: 'iVBORw0KGgoAAAANSUhEUgAA...',
    required: false,
    description: 'Imagem em base64, com ou sem prefixo data URL.',
  })
  profilePictureBase64?: string;

  @ApiProperty({ example: false, required: false })
  removeProfilePicture?: boolean;
}
