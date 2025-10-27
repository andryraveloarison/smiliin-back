import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';

  interface socketInterface {
    action: string,
    id?:string
    userId?: string
  }

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

    emitSocket(module:string, data: socketInterface) {
        this.server.emit(module,data);
      }

    emitAudit(channel: string, payload: { receiverIds: string[]; auditId: string; message: string }) {
      // Exemple 1: broadcast ciblé aux receveurs (rooms = userId)
      payload.receiverIds.forEach((rid) => {
        this.server.to(rid).emit(channel, {
          auditId: payload.auditId,
          message: payload.message,
        });
      });
    }
  }
  