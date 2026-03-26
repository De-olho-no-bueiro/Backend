import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../users/user.module';

import { AuthController } from './infrastructure/http/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

import { LoginUseCase } from './application/use-cases/login.use-case';
import { SignupUseCase } from './application/use-cases/signup.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'chave-muito-secreta-mudar-no-env',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    LoginUseCase,
    SignupUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
  ],
  exports: [JwtStrategy, JwtModule],
})
export class AuthModule {}
