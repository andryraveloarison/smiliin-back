import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PublicationModule } from './modules/publication/publication.module';
import { CategoriesModule } from './modules/categorie/categorie.module';
import { IdeaModule } from './modules/idea/idea.module';
import { AuditModule } from './modules/audit/audit.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './interceptors/audit.interceptor';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/smiliinDb'),
    UserModule,
    AuthModule,
    PublicationModule,
    CategoriesModule,
    IdeaModule,
    AuditModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: AuditInterceptor,
    // },
  ],
})
export class AppModule {}
