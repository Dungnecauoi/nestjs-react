import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

const corsAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: corsAllowedOrigins.length > 0 ? corsAllowedOrigins : true,
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(`user_${userId}`);
      this.logger.log(
        `Client connected & joined room user_${userId}: ${client.id}`,
      );
    } else {
      this.logger.log(`Client connected anonymously: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinUserRoom')
  handleJoinRoom(client: Socket, payload: { userId: string }) {
    if (payload?.userId) {
      client.join(`user_${payload.userId}`);
      this.logger.log(
        `Client ${client.id} explicitly joined user_${payload.userId}`,
      );
    }
  }

  /**
   * Phát thông báo Realtime đến một User cụ thể hoặc Broadcast cho tất cả
   */
  sendNotificationToUser(userId: string | null, notification: any) {
    if (userId) {
      this.server.to(`user_${userId}`).emit('notification', notification);
    } else {
      this.server.emit('notification', notification); // Broadcast all
    }
  }
}
