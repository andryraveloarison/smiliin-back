import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway({
    cors: {
      origin: '*', // ⚠️ en prod, mets ton domaine front
    },
  })
  export class SocketGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
  {
    @WebSocketServer() server: Server;
  
    afterInit(server: Server) {
      console.log('Socket server initialized ✅');
    }
  
    handleConnection(client: Socket) {
      console.log(`Client connecté: ${client.id}`);
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client déconnecté: ${client.id}`);
    }
  
    // ⚡ méthode pour envoyer un event aux clients
    sendPublicationCreated(pub: any) {
      this.server.emit('publicationCreated', pub);
    }

    emitUpdatePublication(id: string) {
        this.server.emit('updatePublication', { id });
      }
  }
  