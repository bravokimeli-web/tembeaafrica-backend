import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Message, MessageDocument, Conversation, ConversationDocument } from './schemas/messaging.schema'

@Injectable()
export class MessagingService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
  ) {}

  async getConversations(userId: string) {
    return this.conversationModel.find({ participants: userId, isDeleted: false })
      .sort({ updatedAt: -1 })
      .populate('participants', 'firstName lastName avatar role')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'firstName lastName' } })
      .lean()
  }

  async startConversation(userId: string, topic: string, relatedBooking?: string) {
    // Find admin/support user or create conversation with platform
    const conversation = await this.conversationModel.create({
      participants: [userId],
      topic,
      relatedBooking,
    })
    return conversation.populate('participants', 'firstName lastName avatar')
  }

  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    const conversation = await this.conversationModel.findById(conversationId)
    if (!conversation) throw new NotFoundException('Conversation not found')

    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.messageModel.find({ conversationId, isDeleted: false })
        .sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('sender', 'firstName lastName avatar role').lean(),
      this.messageModel.countDocuments({ conversationId, isDeleted: false }),
    ])

    // Mark messages as read
    await this.messageModel.updateMany(
      { conversationId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } },
    )

    return { data: data.reverse(), total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async sendMessage(conversationId: string, senderId: string, content: string, attachments: string[] = []) {
    const message = await this.messageModel.create({ conversationId, sender: senderId, content, attachments })
    await this.conversationModel.findByIdAndUpdate(conversationId, { lastMessage: message._id, updatedAt: new Date() })
    return message.populate('sender', 'firstName lastName avatar')
  }

  async getUnreadCount(userId: string) {
    const conversations = await this.conversationModel.find({ participants: userId })
    const conversationIds = conversations.map(c => c._id)
    return this.messageModel.countDocuments({
      conversationId: { $in: conversationIds },
      readBy: { $ne: userId },
      sender: { $ne: userId },
    })
  }
}
