import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { UseGuards } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Message, MessageDocument, Conversation, ConversationDocument } from './schemas/messaging.schema'

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server

  private connectedUsers = new Map<string, string>() // userId -> socketId

  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
  ) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId
    if (userId) {
      this.connectedUsers.set(userId, client.id)
      client.join(`user:${userId}`)
      console.log(`User ${userId} connected to chat`)
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.forEach((socketId, userId) => {
      if (socketId === client.id) this.connectedUsers.delete(userId)
    })
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    client.join(`conversation:${data.conversationId}`)
    return { status: 'joined', conversationId: data.conversationId }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() data: {
    conversationId: string; senderId: string; content: string; attachments?: string[]
  }) {
    const message = await this.messageModel.create({
      conversationId: data.conversationId,
      sender: data.senderId,
      content: data.content,
      attachments: data.attachments || [],
    })

    await this.conversationModel.findByIdAndUpdate(data.conversationId, { lastMessage: message._id })

    const populated = await message.populate('sender', 'firstName lastName avatar')

    // Emit to all participants in the conversation
    this.server.to(`conversation:${data.conversationId}`).emit('new_message', populated)

    return { status: 'sent', message: populated }
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string; userId: string }) {
    await this.messageModel.updateMany(
      { conversationId: data.conversationId, readBy: { $ne: data.userId } },
      { $addToSet: { readBy: data.userId } },
    )
    this.server.to(`conversation:${data.conversationId}`).emit('messages_read', { conversationId: data.conversationId, userId: data.userId })
    return { status: 'marked_read' }
  }

  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string; userId: string; isTyping: boolean }) {
    client.to(`conversation:${data.conversationId}`).emit('user_typing', data)
  }

  notifyUser(userId: string, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data)
  }
}
