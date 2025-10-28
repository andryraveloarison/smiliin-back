import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  UploadedFile, 
  UseInterceptors, 
  NotFoundException 
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminGuard } from '../../guards/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from '../../utils/file.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly usersService: UserService,
    private readonly fileService: FileService,
  ) {}

  // ➡️ CREATE
  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const publicUrl = await this.fileService.uploadFile(
        file.buffer,
        file.originalname,
        'logo',
      );
      createUserDto.logo = publicUrl;
    }
    return this.usersService.create(createUserDto);
  }

  // ➡️ READ ALL (admin only)
  //@UseGuards(AdminGuard)
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // ➡️ READ ONE BY ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOne(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  // ➡️ READ ONE BY EMAIL
  @Get('by-email/:email')
  async findByEmail(@Param('email') email: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException(`User with email ${email} not found`);
    return user;
  }

  // ➡️ UPDATE
  @Put(':id')
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const publicUrl = await this.fileService.uploadFile(
        file.buffer,
        file.originalname,
        'logo',
      );
      updateUserDto.logo = publicUrl; 
    }

    console.log('Updating user with data:', updateUserDto);
    const updatedUser = await this.usersService.update(id, updateUserDto);
    if (!updatedUser) throw new NotFoundException(`User with id ${id} not found`);
    return updatedUser;
  }

  // ➡️ DELETE
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    const deletedUser = await this.usersService.delete(id);
    if (!deletedUser) throw new NotFoundException(`User with id ${id} not found`);
    return deletedUser;
  }
}
