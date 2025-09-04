import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, code: string) {
    const users = await this.userService.findAll();
    const user = users.find(u => u.email === email);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(code, user.code);
    if (!isPasswordValid) return null;

    return user;
  }


  async login(email: string, code: string) {
    const user = await this.validateUser(email, code);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = { id: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      success: true
    };
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
