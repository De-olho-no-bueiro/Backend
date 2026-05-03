import { ApiProperty } from '@nestjs/swagger';
import { CreatePostMediaDto } from './create-post-media.dto';

class FloodAreaCoordinateDto {
  @ApiProperty({ example: -23.1 })
  latitude: number;

  @ApiProperty({ example: -46.1 })
  longitude: number;
}

export class CreateFloodAreaDto {
  @ApiProperty({ type: [FloodAreaCoordinateDto] })
  coordinates: FloodAreaCoordinateDto[];

  @ApiProperty({ example: 'medio', required: false })
  nivel?: string;

  @ApiProperty({ example: 'Cruzamento completamente alagado', required: false })
  descricao?: string;

  @ApiProperty({ example: 'Rua Exemplo', required: false })
  endereco?: string;

  @ApiProperty({ type: [CreatePostMediaDto], required: false })
  mediaUploads?: CreatePostMediaDto[];

  @ApiProperty({ type: [String], required: false, description: 'Compatibilidade legada com base64' })
  midias?: string[];
}
