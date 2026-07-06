import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type AccommodationDocument = Accommodation & Document

@Schema({ _id: false })
class Room {
  @Prop() name: string
  @Prop() description: string
  @Prop() pricePerNight: number
  @Prop() maxGuests: number
  @Prop({ type: [String] }) images: string[]
  @Prop({ type: [String] }) amenities: string[]
}

@Schema({ timestamps: true, collection: 'accommodations' })
export class Accommodation {
  @Prop({ required: true }) name: string
  @Prop({ required: true, unique: true }) slug: string
  @Prop({ enum: ['hotel', 'bnb', 'guesthouse', 'hostel', 'lodge', 'resort', 'villa', 'camping'], required: true }) type: string
  @Prop({ type: Types.ObjectId, ref: 'Destination', required: true }) destination: Types.ObjectId
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) owner: Types.ObjectId
  @Prop({ required: true }) description: string
  @Prop({ type: [String], default: [] }) images: string[]
  @Prop({ required: true, min: 0 }) pricePerNight: number
  @Prop({ default: 'USD' }) currency: string
  @Prop({ default: 0 }) rating: number
  @Prop({ default: 0 }) reviewCount: number
  @Prop({ type: [String], default: [] }) amenities: string[]
  @Prop({ type: [Room], default: [] }) rooms: Room[]
  @Prop({ type: { lat: Number, lng: Number } }) coordinates: { lat: number; lng: number }
  @Prop({ default: false }) featured: boolean
  @Prop({ default: 'active', enum: ['active', 'inactive', 'draft', 'suspended'] }) status: string
  @Prop({ default: false }) isDeleted: boolean
}

export const AccommodationSchema = SchemaFactory.createForClass(Accommodation)
AccommodationSchema.index({ destination: 1 })
AccommodationSchema.index({ type: 1 })
AccommodationSchema.index({ pricePerNight: 1 })
AccommodationSchema.index({ rating: -1 })
AccommodationSchema.index({ featured: 1 })
AccommodationSchema.index({ name: 'text', description: 'text' })
