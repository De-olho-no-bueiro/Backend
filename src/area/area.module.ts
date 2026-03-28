import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AreaController } from './area.controller';
import { AreaService } from './area.service';

@Module({
  imports: [PrismaModule],
  controllers: [AreaController],
  providers: [AreaService],
})
export class AreaModule {}
