import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PageBudget, PageBudgetDocument } from './schemas/pagebudget.schema';
import { PostBudget, PostBudgetDocument } from './schemas/postbudget.schema';
import { GlobalBudget, GlobalBudgetDocument } from './schemas/globalbudget.schema';
import { Publication, PublicationDocument } from '../publication/schema/publication.schema';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class BudgetService {
  constructor(
    @InjectModel(PageBudget.name) private pageBudgetModel: Model<PageBudgetDocument>,
    @InjectModel(PostBudget.name) private postBudgetModel: Model<PostBudgetDocument>,
    @InjectModel(GlobalBudget.name) private globalBudgetModel: Model<GlobalBudgetDocument>,
    @InjectModel(Publication.name) private pubModel: Model<PublicationDocument>,
    private readonly socketGateway: SocketGateway,
  ) {}

  // ===== PageBudget =====
  async createPageBudget(data: Partial<PageBudget>): Promise<PageBudget> {
    const budget = new this.pageBudgetModel({
      ...data,
      pageId: new Types.ObjectId(data.pageId),
    });

    const newBudget = await budget.save()

    this.socketGateway.emitSocket('budgetPage',{
      id: newBudget._id.toString(),
      action: 'create'});

    return newBudget;
  }

  async getPageBudgets(): Promise<PageBudget[]> {
    return this.pageBudgetModel.find().exec();
  }

  async updatePageBudget(id: string, data: Partial<PageBudget>): Promise<PageBudget> {
    this.socketGateway.emitSocket('budgetPage',{
      id: id,
      action: 'update'});
    return this.pageBudgetModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deletePageBudget(id: string): Promise<PageBudget> {
    this.socketGateway.emitSocket('budgetPage',{
      id: id,
      action: 'delete'});
    return this.pageBudgetModel.findByIdAndDelete(id).exec();
  }

  // ===== PostBudget =====
  async createPostBudget(data: Partial<PostBudget>): Promise<PostBudget> {
    const budget = new this.postBudgetModel({
      ...data,
      postId: new Types.ObjectId(data.postId),
      pageId: new Types.ObjectId(data.pageId),
    });

    const newBudget = await (await budget.save()).populate('postId', 'title userId')

    this.socketGateway.emitSocket('budgetPost',{
      id: newBudget._id.toString(),
      action: 'create'});

    return newBudget;
  }

  async getPostBudgets(): Promise<PostBudget[]> {
    return this.postBudgetModel.find().populate('postId').exec(); // populate la publication
  }

  async updatePostBudget(id: string, data: Partial<PostBudget>): Promise<PostBudget> {
    if (data.postId) data.postId = new Types.ObjectId(data.postId);
    if (data.pageId) data.pageId = new Types.ObjectId(data.pageId);

    this.socketGateway.emitSocket('budgetPost',{
      id: id,
      action: 'update'});

    return this.postBudgetModel.findByIdAndUpdate(id, data, { new: true }).populate('postId', 'title userId').exec();
  }


  async deletePostBudget(id: string): Promise<PostBudget> {
    this.socketGateway.emitSocket('budgetPost',{
      id: id,
      action: 'delete'});
    return this.postBudgetModel.findByIdAndDelete(id).exec();
  }

  // ===== GlobalBudget =====
  async createGlobalBudget(data: Partial<GlobalBudget>): Promise<GlobalBudget> {
    const budget = new this.globalBudgetModel({
      ...data,
      pageId: new Types.ObjectId(data.pageId),
    });

    const newBudget = await budget.save();

    this.socketGateway.emitSocket('budgetGlobal', {
      id: newBudget._id.toString(),
      action: 'create'
    });

    return newBudget;
  }

  async getGlobalBudgets(): Promise<GlobalBudget[]> {
    return this.globalBudgetModel.find().exec();
  }

  async updateGlobalBudget(id: string, data: Partial<GlobalBudget>): Promise<GlobalBudget> {
    if (data.pageId) data.pageId = new Types.ObjectId(data.pageId);
    
    this.socketGateway.emitSocket('budgetGlobal', {
      id: id,
      action: 'update'
    });
    
    return this.globalBudgetModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteGlobalBudget(id: string): Promise<GlobalBudget> {
    this.socketGateway.emitSocket('budgetGlobal', {
      id: id,
      action: 'delete'
    });
    return this.globalBudgetModel.findByIdAndDelete(id).exec();
  }
  
  // ===== Page + Post par mois et pageId =====
  async getBudgetsByPageAndMonth(pageId: string, month: string) {
    const pageObjId = new Types.ObjectId(pageId);

    console.log("FETCH")

    const pageBudgets = await this.pageBudgetModel.find({ pageId: pageObjId, month }).exec();
    const postBudgets = await this.postBudgetModel
      .find({ pageId: pageObjId, month })
      .populate('postId', 'title userId status') // récupère le titre et le user de la publication
      .exec();


      console.log("FETCH 2")


    const globalBudget = await this.globalBudgetModel.findOne({ pageId: pageObjId, month }).exec();

    // Calcul des totaux
    const totalPageBudget = pageBudgets.reduce((acc, b) => acc + b.budget, 0);
    const totalPageDepense = pageBudgets.reduce((acc, b) => acc + b.depense, 0);

    // const totalPostBudget = postBudgets.reduce((acc, b) => acc + b.budget, 0);
    // const totalPostDepense = postBudgets.reduce((acc, b) => acc + b.depense, 0);

    //const totalBudget = totalPageBudget + totalPostBudget;
    //const totalDepense = totalPageDepense + totalPostDepense;
    //const ecart = totalBudget - totalDepense;

    const ecart = totalPageBudget - totalPageDepense;
    

    return {
      pageBudgets,
      postBudgets,
      globalBudget,
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
