import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({ example: 'Atualização do comentário', description: 'Novo conteúdo textual do comentário' })
  content: string;
}
