import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Insight, InsightSchema } from './schema/insight.schema';
import { InsightService } from './insight.service';
import { InsightController } from './insight.controller';
import { FileService } from 'src/utils/file.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Insight.name, schema: InsightSchema }])],
  controllers: [InsightController],
  providers: [InsightService, FileService],
})
export class InsightModule {}
