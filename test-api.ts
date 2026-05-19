import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(0);
  const url = await app.getUrl();
  const res = await fetch(`${url}/public/v1/manholes`);
  console.log("STATUS:", res.status);
  console.log("TEXT:", await res.text());
  process.exit(0);
}
bootstrap();
