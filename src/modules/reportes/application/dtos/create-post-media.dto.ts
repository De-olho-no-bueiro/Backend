import { ApiProperty } from '@nestjs/swagger';

export class CreatePostMediaDto {
  @ApiProperty({ example: 'mobile/posts/12/abc-image.jpg' })
  storageKey: string;

  @ApiProperty({ example: 'https://cdn.example.com/mobile/posts/12/abc-image.jpg' })
  url: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty({ example: 2457600 })
  sizeBytes: number;

  @ApiProperty({ example: 1280, required: false })
  width?: number;

  @ApiProperty({ example: 720, required: false })
  height?: number;
}
