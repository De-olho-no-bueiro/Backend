import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, MaxLength, Min, Max } from 'class-validator';

export class CreateManholeDto {
  @ApiProperty({ example: 'Bueiro da Praça' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: -3.7319 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude: number;

  @ApiProperty({ example: -38.5267 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude: number;
}
