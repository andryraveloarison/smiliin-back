// src/publication/publication.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
  
  @WebSocketGateway({
    cors: {
      origin: '*', // ajuste si tu veux restreindre
    },
  })
  export class PublicationGateway {
    @WebSocketServer()
    server: Server;
  
    emitUpdatePublication(id: string) {
      this.server.emit('updatePublication', { id });
    }
  }
  