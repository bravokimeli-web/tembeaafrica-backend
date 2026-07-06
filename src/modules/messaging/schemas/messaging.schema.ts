import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type MessageDocument = Message & Document
export type ConversationDocument = Conversation & Document

@Schema({ timestamps: true, collection: 'messages' })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId

  @Prop({ required: true, maxlength: 5000 })
  content: string

  @Prop({ type: [String], default: [] })
  attachments: string[]

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  readBy: Types.ObjectId[]

  @Prop({ default: false })
  isDeleted: boolean
}

@Schema({ timestamps: true, collection: 'conversations' })
export class Conversation {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  participants: Types.ObjectId[]

  @Prop({ required: true })
  topic: string

  @Prop({ type: Types.ObjectId, ref: 'Booking' })
  relatedBooking?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage?: Types.ObjectId

  @Prop({ default: false })
  isDeleted: boolean
}

export const MessageSchema = SchemaFactory.createForClass(Message)
export const ConversationSchema = SchemaFactory.createForClass(Conversation)

MessageSchema.index({ conversationId: 1, createdAt: -1 })
ConversationSchema.index({ participants: 1 })
ConversationSchema.index({ updatedAt: -1 })
