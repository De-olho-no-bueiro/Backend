import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
  .setTitle("Api De Olho No Bueiro")
  .setDescription("Esta é a api referente ao o projeto da cadeira de Exentsão do Ultimo semenstre de analise de Desenvolvimento de Sistemas da Unifor")
  .setVersion("1.0.0")
  
  .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use("/docs",
    apiReference({
      content: document,
    })
  )

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
