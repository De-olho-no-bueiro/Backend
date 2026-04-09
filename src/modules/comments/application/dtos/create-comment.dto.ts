import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'Muito perigoso esse buraco, passei aí ontem e rasgou meu pneu!', description: 'Conteúdo textual do comentário' })
  content: string;
}
