import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { MobileAuthController } from './mobile.auth.controller';

@Module({
  imports: [AuthModule],
  controllers: [MobileAuthController],
})
export class MobileAuthModule {}
