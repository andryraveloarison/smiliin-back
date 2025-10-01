// src/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schema/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private readonly socketGateway: SocketGateway,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const created = new this.categoryModel(createCategoryDto);
    const newCreated = await created.save()

    this.socketGateway.emitSocket('Categorie',{
      id: newCreated._id.toString(),
      action:'create'});

    return newCreated;
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) throw new NotFoundException(`Category with ID ${id} not found`);
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const updated = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Category with ID ${id} not found`);

    this.socketGateway.emitSocket('Categorie',{
      id,
      action:'update'});

    return updated;
  }

  async remove(id: string): Promise<void> {

    this.socketGateway.emitSocket('Categorie',{
      id,
      action:'delete'});

    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Category with ID ${id} not found`);
  }
}
