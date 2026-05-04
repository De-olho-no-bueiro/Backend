import { Controller, Post, Body, HttpCode, HttpStatus, Module, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AuthModule } from './auth.module';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { SignupUseCase } from './application/use-cases/signup.use-case';
import { WebSignupGuard } from './infrastructure/guards/web-signup.guard';

import { LoginDto } from './application/dtos/login.dto';
import { SignupDto } from './application/dtos/signup.dto';

@ApiTags('web-auth')
@Controller('web/v1/auth')
export class WebAuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly signupUseCase: SignupUseCase,
  ) {}

  @Post('signup')
  @UseGuards(WebSignupGuard)
  @ApiOperation({ summary: 'Cadastrar administrador/operador (Web)' })
  @ApiResponse({ status: 201, description: 'Usuário cadastrado com sucesso.' })
  async signup(@Body() signupDto: SignupDto) {
    return this.signupUseCase.execute(signupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer login no Dashboard Web' })
  @ApiResponse({ status: 200, description: 'Retorna token JWT de administrador.' })
  async login(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [WebAuthController],
})
export class WebAuthModule {}
