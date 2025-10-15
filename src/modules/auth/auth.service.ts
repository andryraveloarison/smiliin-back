import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { DeviceService } from '../device/device.service';
import { DeviceDto } from '../device/dto/device.dto';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly deviceService: DeviceService,
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async validateUser(email: string, code: string) {
    const users = await this.userService.findAll();
    const user = users.find(u => u.email === email);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(code, user.code);
    if (!isPasswordValid) return null;

    return user;
  }

  async generateTokens(userId: string, email: string, role: string, deviceId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId, email, role, deviceId),
      this.generateRefreshToken(userId),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async generateAccessToken(userId: string, email: string, role: string, deviceId: string): Promise<string> {
    const payload = { id: userId, email, role, deviceId };
    return this.jwtService.sign(payload, {
      expiresIn: '24h', // courte durée pour l'access token
    });
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = this.jwtService.sign(
      { id: userId },
      {
        expiresIn: '7d', // plus longue durée pour le refresh token
      }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenModel.create({
      userId: new Types.ObjectId(userId),
      token,
      expiresAt,
    });

    return token;
  }

  async login(email: string, code: string, deviceInfo: DeviceDto) {
    const user = await this.validateUser(email, code);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Vérifier le device
    const existingDevice = await this.deviceService.findByIdMacAndUserId(deviceInfo.idmac, user.id);
    
    let deviceAccess = true;
    if (existingDevice) {
      deviceAccess = existingDevice.access;
      //await this.deviceService.updateConnectionStatus(existingDevice.id.toString(), true);
    } else {
      const newDevice = await this.deviceService.createDevice(user.id, deviceInfo);
      deviceAccess = newDevice.access;
    }

    if (!deviceAccess) {
      throw new UnauthorizedException('Device not authorized');
    }

    let deviceId = existingDevice ? existingDevice.id: deviceInfo.idmac;

    const tokens = await this.generateTokens(user.id, user.email, user.role, deviceId );
    return {
      ...tokens,
      success: true,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      // Vérifier si le refresh token existe et n'est pas révoqué
      const tokenDoc = await this.refreshTokenModel.findOne({
        token: refreshToken,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      });

      if (!tokenDoc) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Vérifier et décoder le refresh token
      const decoded = this.jwtService.verify(refreshToken);
      const user = await this.userService.findOne(decoded.id);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Générer un nouveau access token
      const accessToken = await this.generateAccessToken(user.id, user.email, user.role, decoded.deviceId);

      return {
        access_token: accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(userId: string, refreshToken: string) {
    await this.refreshTokenModel.updateOne(
      { userId: new Types.ObjectId(userId), token: refreshToken },
      { isRevoked: true }
    );
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
