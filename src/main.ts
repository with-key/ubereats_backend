import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // class-validator 를 사용하기 위해 필요한 설정
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(4000);
}
bootstrap();
