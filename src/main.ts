import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function bootstrap() {
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
