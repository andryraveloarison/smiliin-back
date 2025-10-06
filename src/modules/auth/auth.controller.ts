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
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    // Récupérer les infos de l'appareil
    const userAgent = req.headers['user-agent'] as string;
    const ip = req.ip || req.headers['x-forwarded-for'] || null;

    // Si le client fournit un deviceId, on peut aussi le récupérer
    const deviceId = (dto as any).deviceId || null;

    // Pour test, juste retourner ces infos avec l'utilisateur authentifié
    const user = await this.authService.login(dto.email, dto.code); // ton login habituel

    return {
      user,
      device: {
        deviceId,
        userAgent,
        ip,
      },
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
