import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { MobileAuthController } from './mobile.auth.controller';
import { MobileProfileController } from './mobile.profile.controller';
import { UserModule } from '../users/user.module';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [MobileAuthController, MobileProfileController],
})
export class MobileAuthModule {}
