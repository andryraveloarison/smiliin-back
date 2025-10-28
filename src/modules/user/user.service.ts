import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Créer un utilisateur
  async create(userData: Partial<User>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.code, 10);
    const newUser = new this.userModel({
      ...userData,
      code: hashedPassword,
    });
    return newUser.save();
  }

  // Récupérer tous les utilisateurs
  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  // Récupérer un utilisateur par ID
  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  // Récupérer un utilisateur par email
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Mettre à jour un utilisateur
  async update(id: string, updateData: Partial<User>): Promise<UserDocument> {

    console.log('Update data received in service:', updateData);
    if (updateData.code) {
      updateData.code = await bcrypt.hash(updateData.code, 10); // hachage si mot de passe changé
    }
    console.log('Update data after processing:', updateData);
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updatedUser) throw new NotFoundException(`User with id ${id} not found`);
    return updatedUser;
  }

  // Supprimer un utilisateur
  async delete(id: string): Promise<{ deleted: boolean }> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`User with id ${id} not found`);
    return { deleted: true };
  }

  // Valider les identifiants
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.code))) {
      return user;
    }
    return null;
  }
}
