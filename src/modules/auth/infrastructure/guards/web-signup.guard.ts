import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebSignupGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(_context: ExecutionContext): boolean {
    if (this.configService.get<string>('ALLOW_WEB_SIGNUP') === 'true') {
      return true;
    }

    throw new ForbiddenException('Cadastro web desativado neste ambiente.');
  }
}
