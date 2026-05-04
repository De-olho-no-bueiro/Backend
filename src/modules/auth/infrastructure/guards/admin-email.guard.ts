import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

type AuthenticatedRequest = Request & {
  user?: {
    userId: number;
    email: string;
  };
};

@Injectable()
export class AdminEmailGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const email = request.user?.email?.trim().toLowerCase();
    const adminEmails = String(this.configService.get('ADMIN_EMAILS') ?? '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    if (!email || adminEmails.length === 0 || !adminEmails.includes(email)) {
      throw new ForbiddenException('Acesso administrativo não autorizado.');
    }

    return true;
  }
}
