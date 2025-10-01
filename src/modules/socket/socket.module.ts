import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Module({
  providers: [SocketGateway],
  exports: [SocketGateway], // ⚡ pour l'utiliser dans PublicationService
})
export class SocketModule {}
