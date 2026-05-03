import { ApiProperty } from '@nestjs/swagger';
import { CreatePostMediaDto } from './create-post-media.dto';

export class CreateReporteDto {
  @ApiProperty({ example: 'alagamento' })
  tipo: string;

  @ApiProperty({ example: 'baixo', required: false })
  nivel?: string;

  @ApiProperty({ example: -23.123 })
  latitude: number;

  @ApiProperty({ example: -46.123 })
  longitude: number;

  @ApiProperty({ example: 'Rua Exemplo' })
  endereco: string;

  @ApiProperty({ example: 'Asfalto coberto de água', required: false })
  descricao?: string;

  @ApiProperty({ type: [CreatePostMediaDto], required: false })
  mediaUploads?: CreatePostMediaDto[];

  @ApiProperty({ type: [String], required: false, description: 'Compatibilidade legada com base64' })
  midias?: string[];
}
