import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publication, PublicationDocument } from './schema/publication.schema';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { startOfMonth, subMonths } from 'date-fns';

@Injectable()
export class PublicationService {
  constructor(
    @InjectModel(Publication.name) private pubModel: Model<PublicationDocument>,
  ) {}

  async create(dto: CreatePublicationDto): Promise<Publication> {
    const newPub = new this.pubModel(dto);

    return newPub.save();
  }

  // async findAll(): Promise<Publication[]> {
  //   return this.pubModel.find()
  //   .populate('userId', 'id name email logo')
  //   .populate({
  //     path: 'publicationIdeas',
  //     populate: {
  //       path: 'ideas',
  //       select: 'id title images type', // champs utiles de Idea
  //     },
  //   })
  //   .populate({
  //     path: 'postBudget', // <--- virtual populate
  //     select: 'objectif budget depense isBoosted boostPrice month pageId id',
  //   }).populate({
  //     path: 'lastModified',
  //     select: 'action createdAt', 
  //     populate: {
  //       path: 'user',           
  //       select: 'email name logo',   
  //     },
  //   }).exec();
  // }

  async findAll(): Promise<any[]> {
    const publications = await this.pubModel.find()
      .populate('userId', 'id name email logo')
      .populate({
        path: 'publicationIdeas',
        populate: {
          path: 'ideas',
          select: 'id title images type',
        },
      })
      .populate({
        path: 'postBudget',
        select: 'isBoosted',
      })
      .populate({
        path: 'lastModified',
        select: 'action createdAt',
        populate: {
          path: 'user',
          select: 'email name logo',
        },
      })
      .exec();

      return publications;

      
  }

  
  async findOne(id: string): Promise<Publication> {
    const pub = await this.pubModel.findById(id)
    .populate({
      path: 'publicationIdeas',
      populate: {
        path: 'ideas',
        select: 'id title images type', // champs utiles de Idea
      },
    })
        .populate({
      path: 'postBudget', // <--- virtual populate
      select: 'objectif budget depense isBoosted boostPrice month pageId id',
    }).populate({
      path: 'lastModified',
      select: 'action createdAt', 
      populate: {
        path: 'user',           
        select: 'email name logo',   
      },
    }).exec();
    if (!pub) throw new NotFoundException(`Publication with id ${id} not found`);
    return pub;
  }

  async update(id: string, dto: UpdatePublicationDto): Promise<Publication> {
    const updated = await this.pubModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Publication with id ${id} not found`);
    return updated;
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const result = await this.pubModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Publication with id ${id} not found`);
    return { deleted: true };
  }



  async findByUserMonthly(userId: string) {
    const now = new Date();
    const tenMonthsAgo = subMonths(now, 9);
  
    return this.pubModel.aggregate([
      {
        $match: {
          userId,
          publishDate: { $gte: tenMonthsAgo, $lte: now },
        },
      },
      // --- Jointure avec postBudget ---
      {
        $lookup: {
          from: 'postbudget', // nom de la collection Mongo
          localField: '_id',
          foreignField: 'publicationId',
          as: 'postBudget',
        },
      },
      // --- Jointure avec publicationIdeas ---
      {
        $lookup: {
          from: 'publicationideas',
          localField: '_id',
          foreignField: 'publication',
          as: 'publicationIdeas',
        },
      },
      // --- Jointure avec ideas (imbriqué) ---
      {
        $lookup: {
          from: 'ideas',
          localField: 'publicationIdeas.ideas',
          foreignField: '_id',
          as: 'ideas',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$publishDate' } },
          total: { $sum: 1 },
          publications: { $push: '$$ROOT' },
        },
      },
      {
        $addFields: {
          month: '$_id',
          publications: {
            $map: {
              input: '$publications',
              as: 'pub',
              in: {
                id: '$$pub._id',
                userId: '$$pub.userId',
                title: '$$pub.title',
                description: '$$pub.description',
                images: '$$pub.images',
                status: '$$pub.status',
                publishDate: '$$pub.publishDate',
                createdAt: '$$pub.createdAt',
                updatedAt: '$$pub.updatedAt',
                lien: '$$pub.lien',
                postBudget: '$$pub.postBudget',
                publicationIdeas: {
                  $map: {
                    input: '$$pub.publicationIdeas',
                    as: 'pi',
                    in: {
                      id: '$$pi._id',
                      ideas: {
                        $filter: {
                          input: '$$pub.ideas',
                          as: 'idea',
                          cond: { $in: ['$$idea._id', '$$pi.ideas'] },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      { $project: { _id: 0 } },
      { $sort: { month: 1 } },
    ]);
  }
  
  
  

  async findByUserAndMonth(userId: string, year: number, month: number) {
    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  
    return this.pubModel.aggregate([
      {
        $match: {
          userId,
          publishDate: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $lookup: {
          from: 'postbudgets',
          localField: '_id',
          foreignField: 'publicationId',
          as: 'postBudget',
        },
      },
      {
        $lookup: {
          from: 'publicationideas',
          localField: '_id',
          foreignField: 'publication',
          as: 'publicationIdeas',
        },
      },
      {
        $lookup: {
          from: 'ideas',
          localField: 'publicationIdeas.ideas',
          foreignField: '_id',
          as: 'ideas',
        },
      },
      {
        $addFields: { id: '$_id' },
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          title: 1,
          description: 1,
          images: 1,
          status: 1,
          publishDate: 1,
          createdAt: 1,
          updatedAt: 1,
          id: 1,
          lien: 1,
          postBudget: 1,
          publicationIdeas: {
            $map: {
              input: '$publicationIdeas',
              as: 'pi',
              in: {
                id: '$$pi._id',
                ideas: {
                  $filter: {
                    input: '$ideas',
                    as: 'idea',
                    cond: { $in: ['$$idea._id', '$$pi.ideas'] },
                  },
                },
              },
            },
          },
        },
      },
      { $sort: { publishDate: 1 } },
    ]);
  }
  
  
  
  
}
