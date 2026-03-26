import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { SignupUseCase } from '../../application/use-cases/signup.use-case';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';

import { LoginDto } from '../../application/dtos/login.dto';
import { SignupDto } from '../../application/dtos/signup.dto';
import { ForgotPasswordDto } from '../../application/dtos/forgot-password.dto';
import { ResetPasswordDto } from '../../application/dtos/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly signupUseCase: SignupUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Cadastrar um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário cadastrado com sucesso.' })
  async signup(@Body() signupDto: SignupDto) {
    return this.signupUseCase.execute(signupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer login na plataforma' })
  @ApiResponse({ status: 200, description: 'Retorna o token de acesso (JWT).' })
  async login(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar link para reset de senha (envio de email)' })
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
