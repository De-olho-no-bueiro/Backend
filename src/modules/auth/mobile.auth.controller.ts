import { Controller, Post, Body, HttpCode, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';

import { LoginUseCase } from './application/use-cases/login.use-case';
import { SignupUseCase } from './application/use-cases/signup.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RevokeAllSessionsUseCase } from './application/use-cases/revoke-all-sessions.use-case';

import { LoginDto } from './application/dtos/login.dto';
import { SignupDto } from './application/dtos/signup.dto';
import { ForgotPasswordDto } from './application/dtos/forgot-password.dto';
import { ResetPasswordDto } from './application/dtos/reset-password.dto';
import { RefreshTokenDto } from './application/dtos/refresh-token.dto';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';

@ApiTags('mobile-auth')
@Controller('mobile/v1/auth')
export class MobileAuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly signupUseCase: SignupUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly revokeAllSessionsUseCase: RevokeAllSessionsUseCase,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Cadastrar um novo usuário (Mobile)' })
  @ApiResponse({ status: 201, description: 'Usuário cadastrado com sucesso.' })
  async signup(@Body() signupDto: SignupDto) {
    return this.signupUseCase.execute(signupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer login pelo Aplicativo Móvel' })
  @ApiResponse({ status: 200, description: 'Retorna o token de acesso (JWT).' })
  async login(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token pelo refresh token' })
  @ApiResponse({ status: 200, description: 'Retorna novo access token e novo refresh token.' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Encerrar sessão atual' })
  @ApiResponse({ status: 200, description: 'Refresh token invalidado com sucesso.' })
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.logoutUseCase.execute(refreshTokenDto);
  }

  @Post('revoke-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Invalidar todas as sessões do usuário' })
  @ApiResponse({ status: 200, description: 'Todas as sessões foram revogadas.' })
  async revokeAll(@Req() request: Request & { user: { userId: number } }) {
    return this.revokeAllSessionsUseCase.execute(request.user.userId);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar link para reset de senha' })
  @ApiResponse({ status: 200, description: 'Token de recuperação gerado.' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.forgotPasswordUseCase.execute(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resetar a senha usando o token' })
  @ApiResponse({ status: 200, description: 'Senha alterada com sucesso.' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.resetPasswordUseCase.execute(resetPasswordDto);
  }
}
