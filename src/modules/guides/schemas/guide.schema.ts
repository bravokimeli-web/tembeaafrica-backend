import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type GuideDocument = Guide & Document

@Schema({ timestamps: true, collection: 'guides' })
export class Guide {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true }) user: Types.ObjectId
  @Prop({ required: true }) bio: string
  @Prop({ type: [String], default: ['English', 'Swahili'] }) languages: string[]
  @Prop({ type: [String], default: [] }) certifications: string[]
  @Prop({ type: [String], default: [] }) specializations: string[]
  @Prop({ min: 0, default: 0 }) experience: number
  @Prop({ min: 0, default: 0 }) hourlyRate: number
  @Prop({ min: 0, default: 0 }) dailyRate: number
  @Prop({ default: 0 }) rating: number
  @Prop({ default: 0 }) reviewCount: number
  @Prop({ type: [String], default: [] }) portfolio: string[]
  @Prop({ type: [String], default: [] }) availability: string[]
  @Prop({ enum: ['safari', 'mountain', 'cultural', 'city', 'photography'], required: true }) category: string
  @Prop({ default: false }) verified: boolean
  @Prop({ default: 'active', enum: ['active', 'inactive', 'suspended'] }) status: string
  @Prop({ default: false }) isDeleted: boolean
  @Prop({ type: Types.ObjectId, ref: 'Destination' }) primaryDestination?: Types.ObjectId
}

export const GuideSchema = SchemaFactory.createForClass(Guide)
GuideSchema.index({ user: 1 })
GuideSchema.index({ category: 1 })
GuideSchema.index({ rating: -1 })
GuideSchema.index({ verified: 1 })
GuideSchema.index({ dailyRate: 1 })
