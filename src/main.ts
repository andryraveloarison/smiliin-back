import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import * as morgan from 'morgan';
import * as dotenv from 'dotenv';


dotenv.config(); // ⚡ charge .env

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //Autoriser CORS
  app.enableCors({
    origin: '*', // ton front React
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // si tu veux envoyer des cookies ou headers auth
  });

  //app.enableCors();

  // Utiliser morgan
  app.use(morgan('combined'));

  app.useGlobalInterceptors(new ResponseInterceptor());
  // const auditService = app.get(AuditService);
  // app.useGlobalInterceptors(new AuditInterceptor(auditService));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
