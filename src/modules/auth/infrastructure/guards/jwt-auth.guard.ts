import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ): TUser {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (err || !user) {
      this.logger.warn(
        `JWT denied for ${request.method} ${request.url}: hasAuthHeader=${Boolean(authHeader)} reason=${info?.message ?? err?.message ?? 'unknown'}`,
      );
      throw err || new UnauthorizedException(info?.message || 'Unauthorized');
    }

    this.logger.debug(
      `JWT accepted for ${request.method} ${request.url}: userId=${user.userId} hasAuthHeader=${Boolean(authHeader)}`,
    );

    return user;
  }
}
