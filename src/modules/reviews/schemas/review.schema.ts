import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type ReviewDocument = Review & Document

@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId

  @Prop({ enum: ['tour', 'accommodation', 'guide', 'destination'], required: true })
  targetType: string

  @Prop({ required: true })
  targetId: string

  @Prop({ required: true, min: 1, max: 5 })
  rating: number

  @Prop({ required: true, maxlength: 200 })
  title: string

  @Prop({ required: true, maxlength: 2000 })
  body: string

  @Prop({ type: [String], default: [] })
  images: string[]

  @Prop({ default: false })
  verified: boolean

  @Prop({ default: true })
  approved: boolean

  @Prop({ default: false })
  isDeleted: boolean
}

export const ReviewSchema = SchemaFactory.createForClass(Review)
ReviewSchema.index({ targetType: 1, targetId: 1 })
ReviewSchema.index({ user: 1 })
ReviewSchema.index({ rating: -1 })
ReviewSchema.index({ approved: 1, isDeleted: 1 })
