import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
  .setTitle("Api De Olho No Bueiro")
  .setDescription("Esta API atende tanto o aplicativo móvel quanto o sistema de gestão online.")
  .setVersion("1.0.0")
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use("/api/docs",
    apiReference({
      content: document,
    })
  )

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
