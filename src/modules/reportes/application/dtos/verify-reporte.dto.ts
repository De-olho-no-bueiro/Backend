import { ApiProperty } from '@nestjs/swagger';

export class VerifyReporteDto {
  @ApiProperty({ example: true, description: 'Se o incidente ainda está acontecendo' })
  isStillHappening: boolean;
}
