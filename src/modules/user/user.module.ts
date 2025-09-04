import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schema/user.schema';
import { AuthModule } from '../auth/auth.module';
import { FileService } from 'src/utils/file.service';

@Module({
  imports: [
    forwardRef(() => AuthModule), // <- ici aussi
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // <-- IMPORTANT
  ],
  providers: [UserService, FileService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
