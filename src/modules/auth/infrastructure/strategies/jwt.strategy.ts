import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'chave-muito-secreta-mudar-no-env',
    });

    this.logger.log(
      `JWT strategy initialized. JWT_SECRET configured=${Boolean(
        this.configService.get<string>('JWT_SECRET'),
      )}`,
    );
  }

  async validate(payload: any) {
    this.logger.debug(`Validating JWT payload for userId=${payload?.sub} email=${payload?.email}`);
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      this.logger.warn(`JWT payload rejected: user ${payload?.sub} not found`);
      throw new UnauthorizedException('Token inválido ou usuário não existe');
    }
    return { userId: payload.sub, email: payload.email };
  }
}
