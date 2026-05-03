import { ApiProperty } from '@nestjs/swagger';

export class CreateUploadFileDto {
  @ApiProperty({ example: 'street-flooding.jpg' })
  fileName: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty({ example: 2457600 })
  sizeBytes: number;

  @ApiProperty({ example: 1280, required: false })
  width?: number;

  @ApiProperty({ example: 720, required: false })
  height?: number;
}

export class CreateUploadUrlDto {
  @ApiProperty({ type: [CreateUploadFileDto] })
  files: CreateUploadFileDto[];
}
