import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { DeviceModule } from '../device/device.module';
import { AuthController } from './auth.controller';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    forwardRef(() => UserModule), // <- ici, pour éviter la circularité
    DeviceModule,
    AuditModule,
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '15m' }, // durée par défaut pour l'access token
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
