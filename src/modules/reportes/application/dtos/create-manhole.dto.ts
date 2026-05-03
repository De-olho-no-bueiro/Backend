import { ApiProperty } from '@nestjs/swagger';
import { CreatePostMediaDto } from './create-post-media.dto';

export class CreateManholeDto {
  @ApiProperty({ example: -23.123 })
  latitude: number;

  @ApiProperty({ example: -46.123 })
  longitude: number;

  @ApiProperty({ example: 'Bueiro sem tampa', required: false })
  descricao?: string;

  @ApiProperty({ example: 'Rua Exemplo', required: false })
  endereco?: string;

  @ApiProperty({ type: [CreatePostMediaDto], required: false })
  mediaUploads?: CreatePostMediaDto[];

  @ApiProperty({ type: [String], required: false, description: 'Compatibilidade legada com base64' })
  midias?: string[];
}
