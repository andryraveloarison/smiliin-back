// src/budget/budget.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { PageBudget, PageBudgetSchema } from './schemas/pagebudget.schema';
import { PostBudget, PostBudgetSchema } from './schemas/postbudget.schema';
import { Publication, PublicationSchema } from '../publication/schema/publication.schema';
import { SocketGateway } from '../socket/socket.gateway';
import { GlobalBudget, GlobalBudgetSchema } from './schemas/globalbudget.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PageBudget.name, schema: PageBudgetSchema },
      { name: PostBudget.name, schema: PostBudgetSchema },
      { name: Publication.name, schema: PublicationSchema },
      { name: GlobalBudget.name, schema: GlobalBudgetSchema },

    ]),
  ],
  providers: [BudgetService, SocketGateway],
  controllers: [BudgetController],
  exports: [BudgetService],
})
export class BudgetModule {}
