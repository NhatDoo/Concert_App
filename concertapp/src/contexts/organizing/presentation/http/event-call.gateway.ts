import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { EventConcertAccessService } from '../../application/event-concert-access.service';

type SignalMessage = {
  concertId?: string;
  targetId?: string;
  description?: { type: 'offer' | 'answer'; sdp?: string };
  candidate?: {
    candidate: string;
    sdpMid?: string | null;
    sdpMLineIndex?: number | null;
    usernameFragment?: string | null;
  };
};

type CallSocketData = {
  userId?: string;
  name?: string;
  concertId?: string;
};

interface CallSocket extends Socket {
  data: CallSocketData;
}

@WebSocketGateway({ cors: { origin: true } })
export class EventCallGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly concertAccess: EventConcertAccessService,
  ) {}

  async handleConnection(client: CallSocket) {
    const token: unknown = client.handshake.auth?.token;
    if (typeof token !== 'string') {
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub?: string;
        name?: string;
      }>(token);
      if (!payload.sub) {
        client.disconnect(true);
        return;
      }
      client.data.userId = payload.sub;
      client.data.name = payload.name || 'Thành viên';
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: CallSocket) {
    const concertId = client.data.concertId;
    if (!concertId) return;
    client
      .to(this.roomName(concertId))
      .emit('call:peer-left', { peerId: client.id });
  }

  @SubscribeMessage('call:join')
  async joinCall(
    @ConnectedSocket() client: CallSocket,
    @MessageBody() message: SignalMessage,
  ) {
    const concertId = message.concertId;
    const userId = client.data.userId;
    if (
      !concertId ||
      !userId ||
      !(await this.concertAccess.canJoinCall(userId, concertId))
    ) {
      client.emit('call:error', {
        message: 'Bạn không có quyền tham gia phòng gọi này.',
      });
      return;
    }

    const previousConcertId = client.data.concertId;
    if (previousConcertId && previousConcertId !== concertId) {
      await client.leave(this.roomName(previousConcertId));
      client
        .to(this.roomName(previousConcertId))
        .emit('call:peer-left', { peerId: client.id });
    }

    const roomName = this.roomName(concertId);
    await client.join(roomName);
    client.data.concertId = concertId;

    const peers = await this.server.in(roomName).fetchSockets();
    client.emit('call:participants', {
      peers: peers
        .filter((peer) => peer.id !== client.id)
        .map((peer) => ({ id: peer.id, name: 'Thành viên' })),
    });
    client.to(roomName).emit('call:peer-joined', {
      peerId: client.id,
      name: client.data.name,
    });
  }

  @SubscribeMessage('call:leave')
  async leaveCall(@ConnectedSocket() client: CallSocket) {
    const concertId = client.data.concertId;
    if (!concertId) return;
    await client.leave(this.roomName(concertId));
    delete client.data.concertId;
    client
      .to(this.roomName(concertId))
      .emit('call:peer-left', { peerId: client.id });
  }

  @SubscribeMessage('call:offer')
  relayOffer(
    @ConnectedSocket() client: CallSocket,
    @MessageBody() message: SignalMessage,
  ) {
    this.relay(client, message, 'call:offer', {
      description: message.description,
    });
  }

  @SubscribeMessage('call:answer')
  relayAnswer(
    @ConnectedSocket() client: CallSocket,
    @MessageBody() message: SignalMessage,
  ) {
    this.relay(client, message, 'call:answer', {
      description: message.description,
    });
  }

  @SubscribeMessage('call:ice-candidate')
  relayCandidate(
    @ConnectedSocket() client: CallSocket,
    @MessageBody() message: SignalMessage,
  ) {
    this.relay(client, message, 'call:ice-candidate', {
      candidate: message.candidate,
    });
  }

  private relay(
    client: CallSocket,
    message: SignalMessage,
    event: string,
    payload: Pick<SignalMessage, 'description' | 'candidate'>,
  ) {
    const concertId = client.data.concertId;
    const targetId = message.targetId;
    if (!concertId || !targetId) return;

    const target = this.server.sockets.sockets.get(targetId);
    if (!target?.rooms.has(this.roomName(concertId))) return;
    this.server.to(targetId).emit(event, {
      from: client.id,
      name: client.data.name || 'Thành viên',
      ...payload,
    });
  }

  private roomName(concertId: string) {
    return `concert-call:${concertId}`;
  }
}
