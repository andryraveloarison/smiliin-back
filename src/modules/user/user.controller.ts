import { 
  Controller, 
  Get, 
  Post, 
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
import { AdminGuard } from '../../guards/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from '../../utils/file.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly usersService: UserService,
    private readonly fileService: FileService,
  ) {}

  // ➡️ Créer un user
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

  // ➡️ Récupérer tous les users (admin only)
  @UseGuards(AdminGuard)
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // ➡️ Récupérer un user par son ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOne(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  // ➡️ Récupérer un user par son email
  @Get('by-email/:email')
  async findByEmail(@Param('email') email: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException(`User with email ${email} not found`);
    return user;
  }
}
