import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PublicationModule } from './modules/publication/publication.module';
import { CategoriesModule } from './modules/categorie/categorie.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/smiliinDb'),
    UserModule,
    AuthModule,
    PublicationModule,
    CategoriesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
