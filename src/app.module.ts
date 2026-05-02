import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';

import { UserModule } from './modules/users/user.module';

import { MobileAuthModule } from './modules/auth/mobile.auth.module';
import { WebAuthModule } from './modules/auth/web.auth.module';
import { MobileReportesModule } from './modules/reportes/mobile.reportes.module';
import { WebReportesModule } from './modules/reportes/web.reportes.module';
import { CommentsModule } from './modules/comments/comments.module';

@Module({
  imports: [
    HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UserModule,
    MobileAuthModule,
    WebAuthModule,
    MobileReportesModule,
    WebReportesModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
