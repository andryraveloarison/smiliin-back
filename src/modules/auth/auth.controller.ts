import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../guards/auth.guard';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {

    // Pour test, juste retourner ces infos avec l'utilisateur authentifié
    const user = await this.authService.login(dto.email, dto.code); // ton login habituel

    return {
      user
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() request: Request) {
    // request.user est défini par le JwtAuthGuard
    const user = await this.userService.findOne((request.user as any).id);

    return { user };
  }
}
