import { Module } from '@nestjs/common';
import { MobileUploadsController } from './mobile.uploads.controller';
import { UploadsService } from './application/services/uploads.service';

@Module({
  controllers: [MobileUploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
