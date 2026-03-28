import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import helmet from 'helmet';
import { AppModule } from './app.module';

function parseCorsOrigins(
  raw: string | undefined,
): boolean | string | string[] {
  if (raw === undefined || raw.trim() === '') {
    return true;
  }
  const list = raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (list.length === 0) {
    return true;
  }
  return list.length === 1 ? list[0]! : list;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // Scalar em /docs usa scripts inline; CSP padrão do Helmet quebra a UI
      contentSecurityPolicy: false,
    }),
  );

  app.enableCors({
    origin: parseCorsOrigins(config.get<string>('CORS_ORIGINS')),
    credentials: config.get<string>('CORS_CREDENTIALS') === 'true',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    maxAge: 86400,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const openApiConfig = new DocumentBuilder()
    .setTitle('Api De Olho No Bueiro')
    .setDescription(
      'Esta é a api referente ao o projeto da cadeira de Exentsão do Ultimo semenstre de analise de Desenvolvimento de Sistemas da Unifor',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, openApiConfig);

  app.use(
    '/docs',
    apiReference({
      content: document,
    }),
  );

  await app.listen(config.get('PORT') ?? 3000);
}
bootstrap();
