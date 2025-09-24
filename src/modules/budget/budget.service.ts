import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PageBudget, PageBudgetDocument } from './schemas/pagebudget.schema';
import { PostBudget, PostBudgetDocument } from './schemas/postbudget.schema';
import { Publication, PublicationDocument } from '../publication/schema/publication.schema';

@Injectable()
export class BudgetService {
  constructor(
    @InjectModel(PageBudget.name) private pageBudgetModel: Model<PageBudgetDocument>,
    @InjectModel(PostBudget.name) private postBudgetModel: Model<PostBudgetDocument>,
    @InjectModel(Publication.name) private pubModel: Model<PublicationDocument>,
  ) {}

  // ===== PageBudget =====
  async createPageBudget(data: Partial<PageBudget>): Promise<PageBudget> {
    const budget = new this.pageBudgetModel({
      ...data,
      pageId: new Types.ObjectId(data.pageId),
    });
    return budget.save();
  }

  async getPageBudgets(): Promise<PageBudget[]> {
    return this.pageBudgetModel.find().exec();
  }

  async updatePageBudget(id: string, data: Partial<PageBudget>): Promise<PageBudget> {
    return this.pageBudgetModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deletePageBudget(id: string): Promise<PageBudget> {
    return this.pageBudgetModel.findByIdAndDelete(id).exec();
  }

  // ===== PostBudget =====
  async createPostBudget(data: Partial<PostBudget>): Promise<PostBudget> {
    const budget = new this.postBudgetModel({
      ...data,
      postId: new Types.ObjectId(data.postId),
      pageId: new Types.ObjectId(data.pageId),
    });
    return (await budget.save()).populate('postId', 'title userId');
  }

  async getPostBudgets(): Promise<PostBudget[]> {
    return this.postBudgetModel.find().populate('postId').exec(); // populate la publication
  }

  async updatePostBudget(id: string, data: Partial<PostBudget>): Promise<PostBudget> {
    if (data.postId) data.postId = new Types.ObjectId(data.postId);
    if (data.pageId) data.pageId = new Types.ObjectId(data.pageId);
    return this.postBudgetModel.findByIdAndUpdate(id, data, { new: true }).populate('postId', 'title userId').exec();
  }


  async deletePostBudget(id: string): Promise<PostBudget> {
    return this.postBudgetModel.findByIdAndDelete(id).exec();
  }
  
  // ===== Page + Post par mois et pageId =====
  async getBudgetsByPageAndMonth(pageId: string, month: string) {
    const pageObjId = new Types.ObjectId(pageId);

    const pageBudgets = await this.pageBudgetModel.find({ pageId: pageObjId, month }).exec();
    const postBudgets = await this.postBudgetModel
      .find({ pageId: pageObjId, month })
      .populate('postId', 'title userId') // récupère le titre et le user de la publication
      .exec();

    // Calcul des totaux
    const totalPageBudget = pageBudgets.reduce((acc, b) => acc + b.budget, 0);
    const totalPageDepense = pageBudgets.reduce((acc, b) => acc + b.depense, 0);

    // const totalPostBudget = postBudgets.reduce((acc, b) => acc + b.budget, 0);
    // const totalPostDepense = postBudgets.reduce((acc, b) => acc + b.depense, 0);

    //const totalBudget = totalPageBudget + totalPostBudget;
    //const totalDepense = totalPageDepense + totalPostDepense;
    //const ecart = totalBudget - totalDepense;

    const ecart=totalPageBudget-totalPageDepense
    

    return {
      pageBudgets,
      postBudgets,
      resume: {
        totalPageBudget, 
        totalPageDepense,
        ecart,
      },
      month,
      clientId: pageId
    };
  }
}
