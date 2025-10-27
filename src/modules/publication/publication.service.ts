import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publication, PublicationDocument } from './schema/publication.schema';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { Types } from "mongoose";
import { subMonths, startOfMonth, format as fmt } from "date-fns";
import { SocketGateway } from '../socket/socket.gateway';
@Injectable()
export class PublicationService {
 constructor(
   @InjectModel(Publication.name) private pubModel: Model<PublicationDocument>,
   private readonly socketGateway: SocketGateway,
 ) {}


 async create(dto: CreatePublicationDto,createdBy: string): Promise<Publication> {
    let newPub = new this.pubModel(dto);

  
    const newPubs = await newPub.save()

    const pub = await this.pubModel.findById(newPubs.id)
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
        select: 'isBoosted budget objectif depense boostPrice month pageId',
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

    // ✅ Émettre le socket ici
    this.socketGateway.emitSocket('publication',{
    id: newPubs._id.toString(),
    userId: createdBy,
    action: 'create'});

   return pub;
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
  try {

    const publications = await this.pubModel
      .find()
      // 1) Auteur
      .populate({
        path: 'userId',
        select: 'name email logo',        // pas besoin de 'id' ici
        model: 'User',                    // ensure: MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])
      })
      // 2) Idées de la publication (container)
      .populate({
        path: 'publicationIdeas',         // assure-toi que ce champ existe dans le schéma Publication
        model: 'PublicationIdea',         // <-- adapte au vrai nom du modèle
        populate: {
          path: 'ideas',                  // champ dans PublicationIdea qui référence Idea(s)
          select: 'title images type',
          model: 'Idea',                  // <-- adapte si ton modèle s’appelle différemment
        },
      })
      // 3) Budgets (⚠️ vérifie bien le nom: postBudget vs postBudgets)
      .populate({
        path: 'postBudget',              // <- si ton champ est bien au pluriel
        select: 'isBoosted budget objectif depense boostPrice month pageId',
        model: 'PostBudget',              // <-- adapte au nom réel du modèle
      })

      .exec();

    return publications;

  } catch (err) {
    // Log détaillé pour voir le chemin qui coince
    console.error('findAll publications error:', err?.message, err);
    // Optionnel: activer le debug Mongoose pour voir les paths
    // mongoose.set('debug', true);

    throw new InternalServerErrorException(err?.message || 'Error fetching publications');
  }
}

  async findOne(id: string): Promise<Publication> {
   const pub = await this.pubModel.findById(id)
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
       select: 'isBoosted budget objectif depense boostPrice month pageId',
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
   if (!pub) throw new NotFoundException(`Publication with id ${id} not found`);
   return pub;
 }


 async update(id: string, dto: UpdatePublicationDto, updatedBy: string): Promise<Publication> {
   const updated = await this.pubModel
     .findByIdAndUpdate(id, dto, { new: true })
     .exec();
   if (!updated) throw new NotFoundException(`Publication with id ${id} not found`);

  

    // ✅ Émettre le socket ici
    this.socketGateway.emitSocket('publication',{
      id: updated._id.toString(),
      action: 'update',
      userId: updatedBy
    });

   return updated;
 }


 async delete(id: string,deletedBy: string): Promise<{ deleted: boolean, id: string }> {
    const result = await this.pubModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Publication with id ${id} not found`);

    // ✅ Émettre le socket ici
    this.socketGateway.emitSocket('publication',{
    id: id,
    userId: deletedBy,
    action: 'delete'});
    
   return { deleted: true , id};
 }


async findByUserMonthly(userId: string) {
 const now = new Date();
 const from = startOfMonth(subMonths(now, 9)); // début du mois il y a 9 mois


 return this.pubModel.aggregate([
   // 1) Match sur userId (ObjectId ou string)
   {
     $match: {
       $or: [
         { userId: new Types.ObjectId(userId) },
         { userId: userId as any },
       ],
     },
   },


   // 2) Date de travail: publishDate si dispo, sinon createdAt
   { $addFields: { _date: { $ifNull: ["$publishDate", "$createdAt"] } } },


   // 3) Filtre temporel
   { $match: { _date: { $gte: from, $lte: now } } },


   // 4a) postBudget où postId est un ObjectId
   {
     $lookup: {
       from: "postbudgets",
       let: { pid: "$_id" },
       pipeline: [
         { $match: { $expr: { $eq: ["$postId", "$$pid"] } } },
         { $project: { _id: 1, postId: 1, isBoosted: 1, objectif: 1, budget: 1, depense: 1, boostPrice: 1, month: 1, pageId: 1, createdAt: 1 } },
       ],
       as: "postBudgetObj",
     },
   },


   // 4b) postBudget où postId est une string d'ObjectId (à convertir)
   {
     $lookup: {
       from: "postbudgets",
       let: { pid: "$_id" },
       pipeline: [
         {
           $match: {
             $expr: {
               $and: [
                 { $ne: [{ $type: "$postId" }, "objectId"] },
                 { $eq: [{ $toObjectId: "$postId" }, "$$pid"] },
               ],
             },
           },
         },
         { $project: { _id: 1, postId: 1, isBoosted: 1, objectif: 1, budget: 1, depense: 1, boostPrice: 1, month: 1, pageId: 1, createdAt: 1 } },
       ],
       as: "postBudgetStr",
     },
   },


   // 4c) concat et déduplication par _id (au cas où)
   {
     $addFields: {
       postBudgetAll: {
         $concatArrays: [
           { $ifNull: ["$postBudgetObj", []] },
           { $ifNull: ["$postBudgetStr", []] },
         ],
       },
     },
   },
   {
     // déduplique sur _id pour éviter doublons si un même doc matchait les deux branches
     $set: {
       postBudget: {
         $map: {
           input: {
             $setUnion: [
               {
                 $map: {
                   input: "$postBudgetAll",
                   as: "b",
                   in: "$$b._id",
                 },
               },
             ],
           },
           as: "id",
           in: {
             $first: {
               $filter: {
                 input: "$postBudgetAll",
                 as: "b",
                 cond: { $eq: ["$$b._id", "$$id"] },
               },
             },
           },
         },
       },
     },
   },
   { $unset: ["postBudgetObj", "postBudgetStr", "postBudgetAll"] },


   // 5) publicationIdeas (1:n)
   {
     $lookup: {
       from: "publicationideas",
       localField: "_id",
       foreignField: "publication",
       as: "publicationIdeas",
     },
   },


   // 6) ideas
   {
     $lookup: {
       from: "ideas",
       let: { ideaIds: "$publicationIdeas.ideas" },
       pipeline: [
         {
           $match: {
             $expr: {
               $in: [
                 "$_id",
                 {
                   $ifNull: [
                     {
                       $reduce: {
                         input: "$$ideaIds",
                         initialValue: [],
                         in: { $setUnion: ["$$value", "$$this"] },
                       },
                     },
                     [],
                   ],
                 },
               ],
             },
           },
         },
       ],
       as: "ideas",
     },
   },


   // 7) group par mois
   {
     $group: {
       _id: { $dateToString: { format: "%Y-%m", date: "$_date" } },
       total: { $sum: 1 },
       publications: { $push: "$$ROOT" },
     },
   },


   // 8) remodelage
   {
     $addFields: {
       month: "$_id",
       publications: {
         $map: {
           input: "$publications",
           as: "pub",
           in: {
             id: "$$pub._id",
             userId: "$$pub.userId",
             title: "$$pub.title",
             description: "$$pub.description",
             images: "$$pub.images",
             status: "$$pub.status",
             publishDate: "$$pub.publishDate",
             createdAt: "$$pub.createdAt",
             updatedAt: "$$pub.updatedAt",
             lien: "$$pub.lien",


             // ✅ tableau complet (dédupliqué)
             postBudget: {
               $map: {
                 input: "$$pub.postBudget",
                 as: "b",
                 in: {
                   id: "$$b._id",
                   postId: "$$b.postId",
                   isBoosted: "$$b.isBoosted",
                   objectif: "$$b.objectif",
                   budget: "$$b.budget",
                   depense: "$$b.depense",
                   boostPrice: "$$b.boostPrice",
                   month: "$$b.month",
                   pageId: "$$b.pageId",
                   createdAt: "$$b.createdAt",
                 },
               },
             },


             publicationIdeas: {
               $map: {
                 input: "$$pub.publicationIdeas",
                 as: "pi",
                 in: {
                   id: "$$pi._id",
                   ideas: {
                     $filter: {
                       input: "$$pub.ideas",
                       as: "idea",
                       cond: { $in: ["$$idea._id", "$$pi.ideas"] },
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
 const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
 const end   = new Date(year, month, 0, 23, 59, 59, 999);


 return this.pubModel.aggregate([
   // 1) Match user + fenêtre (en travaillant avec _date ensuite)
   {
     $match: {
       $or: [
         { userId: new Types.ObjectId(userId) },
         { userId: userId as any },
       ],
     },
   },


   // 2) _date = publishDate || createdAt
   { $addFields: { _date: { $ifNull: ["$publishDate", "$createdAt"] } } },


   // 3) filtre sur le mois demandé
   { $match: { _date: { $gte: start, $lte: end } } },


   // 4a) postBudget: postId est un ObjectId
   {
     $lookup: {
       from: "postbudgets",
       let: { pid: "$_id" },
       pipeline: [
         { $match: { $expr: { $eq: ["$postId", "$$pid"] } } },
         { $project: { _id: 1, postId: 1, isBoosted: 1, objectif: 1, budget: 1, depense: 1, boostPrice: 1, month: 1, pageId: 1, createdAt: 1 } },
       ],
       as: "postBudgetObj",
     },
   },


   // 4b) postBudget: postId est une string d'ObjectId
   {
     $lookup: {
       from: "postbudgets",
       let: { pid: "$_id" },
       pipeline: [
         {
           $match: {
             $expr: {
               $and: [
                 { $ne: [{ $type: "$postId" }, "objectId"] },
                 { $eq: [{ $toObjectId: "$postId" }, "$$pid"] },
               ],
             },
           },
         },
         { $project: { _id: 1, postId: 1, isBoosted: 1, objectif: 1, budget: 1, depense: 1, boostPrice: 1, month: 1, pageId: 1, createdAt: 1 } },
       ],
       as: "postBudgetStr",
     },
   },


   // 4c) concat + déduplication
   {
     $addFields: {
       postBudgetAll: {
         $concatArrays: [
           { $ifNull: ["$postBudgetObj", []] },
           { $ifNull: ["$postBudgetStr", []] },
         ],
       },
     },
   },
   {
     $set: {
       postBudget: {
         $map: {
           input: {
             $setUnion: [
               {
                 $map: {
                   input: "$postBudgetAll",
                   as: "b",
                   in: "$$b._id",
                 },
               },
             ],
           },
           as: "id",
           in: {
             $first: {
               $filter: {
                 input: "$postBudgetAll",
                 as: "b",
                 cond: { $eq: ["$$b._id", "$$id"] },
               },
             },
           },
         },
       },
     },
   },
   { $unset: ["postBudgetObj", "postBudgetStr", "postBudgetAll"] },


   // 5) publicationIdeas (1:n)
   {
     $lookup: {
       from: "publicationideas",
       localField: "_id",
       foreignField: "publication",
       as: "publicationIdeas",
     },
   },


   // 6) ideas pour toutes les publicationIdeas (pipeline robuste)
   {
     $lookup: {
       from: "ideas",
       let: { ideaIds: "$publicationIdeas.ideas" },
       pipeline: [
         {
           $match: {
             $expr: {
               $in: [
                 "$_id",
                 {
                   $ifNull: [
                     {
                       $reduce: {
                         input: "$$ideaIds",
                         initialValue: [],
                         in: { $setUnion: ["$$value", "$$this"] },
                       },
                     },
                     [],
                   ],
                 },
               ],
             },
           },
         },
       ],
       as: "ideas",
     },
   },


   // 7) projection finale
   {
     $addFields: { id: "$_id" },
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


       // ✅ tous les budgets (dédupliqués)
       postBudget: {
         $map: {
           input: "$postBudget",
           as: "b",
           in: {
             id: "$$b._id",
             postId: "$$b.postId",
             isBoosted: "$$b.isBoosted",
             objectif: "$$b.objectif",
             budget: "$$b.budget",
             depense: "$$b.depense",
             boostPrice: "$$b.boostPrice",
             month: "$$b.month",
             pageId: "$$b.pageId",
             createdAt: "$$b.createdAt",
           },
         },
       },


       publicationIdeas: {
         $map: {
           input: "$publicationIdeas",
           as: "pi",
           in: {
             id: "$$pi._id",
             ideas: {
               $filter: {
                 input: "$ideas",
                 as: "idea",
                 cond: { $in: ["$$idea._id", "$$pi.ideas"] },
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
