import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAreaDto {
  @ApiProperty({ example: 'Centro histórico' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: [-3.7319, -3.732, -3.7321],
    description: 'Vértices do polígono (mesmo tamanho que longitude)',
  })
  @IsArray()
  @ArrayMinSize(3, { message: 'Polígono precisa de ao menos 3 vértices' })
  @IsNumber({}, { each: true })
  @Type(() => Number)
  latitude: number[];

  @ApiProperty({
    example: [-38.5267, -38.527, -38.5272],
    description: 'Vértices do polígono (mesmo tamanho que latitude)',
  })
  @IsArray()
  @ArrayMinSize(3, { message: 'Polígono precisa de ao menos 3 vértices' })
  @IsNumber({}, { each: true })
  @Type(() => Number)
  longitude: number[];
}
