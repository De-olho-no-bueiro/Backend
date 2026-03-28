import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ManholeController } from './manhole.controller';
import { ManholeService } from './manhole.service';

@Module({
  imports: [PrismaModule],
  controllers: [ManholeController],
  providers: [ManholeService],
})
export class ManholeModule {}
