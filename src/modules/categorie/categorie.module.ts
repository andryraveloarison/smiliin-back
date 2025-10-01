// src/categories/categories.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesService } from './categorie.service';
import { CategoriesController } from './categorie.controller';
import { Category, CategorySchema } from './schema/category.schema';
import { SocketGateway } from '../socket/socket.gateway';

@Module({
  imports: [MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }])],
  controllers: [CategoriesController],
  providers: [CategoriesService,SocketGateway],
  exports: [CategoriesService],
})
export class CategoriesModule {}
