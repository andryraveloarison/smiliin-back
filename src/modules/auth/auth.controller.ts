import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../guards/auth.guard';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.login(dto.pseudo, dto.code, dto.device);
    return user;
  }



  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() request: Request) {
    const user = await this.userService.findOne((request.user as any).id);
    console.log(request.user.deviceId);
    return { user };
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() request: Request, @Body()  dto: LogoutDto ) {
    return await this.authService.logout((request.user as any).id, dto.refreshToken, dto.device);
  }
  
}
