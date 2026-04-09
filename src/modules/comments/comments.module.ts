import { Module } from '@nestjs/common';
import { MobileCommentsController } from './mobile.comments.controller';
import { CommentsService } from './application/services/comments.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MobileCommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
