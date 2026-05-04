import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // TODO: Configuração de CORS aberta para todas as origens (*).
  // Em produção, restrinja para o domínio real por segurança.
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Aumentar o limite de payload para suportar as imagens base64 do mobile
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  const docsEnabled =
    process.env.ENABLE_API_DOCS === 'true' || process.env.NODE_ENV !== 'production';

  if (docsEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Api De Olho No Bueiro')
      .setDescription('Esta API atende tanto o aplicativo móvel quanto o sistema de gestão online.')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);

    app.use(
      '/api/docs',
      apiReference({
        content: document,
      }),
    );
  }

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
