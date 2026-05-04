import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../users/user.module';


import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AdminEmailGuard } from './infrastructure/guards/admin-email.guard';
import { WebSignupGuard } from './infrastructure/guards/web-signup.guard';

import { LoginUseCase } from './application/use-cases/login.use-case';
import { SignupUseCase } from './application/use-cases/signup.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RevokeAllSessionsUseCase } from './application/use-cases/revoke-all-sessions.use-case';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: (() => {
          const jwtSecret = configService.get<string>('JWT_SECRET');
          if (!jwtSecret) {
            throw new Error('JWT_SECRET ausente. Defina variável de ambiente antes de iniciar API.');
          }
          return jwtSecret;
        })(),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [],
  providers: [
    JwtStrategy,
    LoginUseCase,
    SignupUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    RevokeAllSessionsUseCase,
    AdminEmailGuard,
    WebSignupGuard,
  ],
  exports: [
    JwtStrategy, 
    JwtModule,
    LoginUseCase,
    SignupUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    RevokeAllSessionsUseCase,
    AdminEmailGuard,
    WebSignupGuard,
  ],
})
export class AuthModule {}
