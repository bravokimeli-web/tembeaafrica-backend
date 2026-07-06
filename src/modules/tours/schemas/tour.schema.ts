import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type TourDocument = Tour & Document

@Schema({ _id: false })
class ItineraryDay {
  @Prop({ required: true }) day: number
  @Prop({ required: true }) title: string
  @Prop({ required: true }) description: string
  @Prop({ type: [String] }) activities: string[]
  @Prop({ type: [String] }) meals: string[]
  @Prop() accommodation?: string
}

@Schema({ _id: false })
class PricingTier {
  @Prop() minGuests: number
  @Prop() maxGuests: number
  @Prop() pricePerPerson: number
}

@Schema({ timestamps: true, collection: 'tours' })
export class Tour {
  @Prop({ required: true, trim: true })
  title: string

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string

  @Prop({ required: true })
  description: string

  @Prop()
  shortDescription?: string

  @Prop({ type: Types.ObjectId, ref: 'Destination', required: true })
  destination: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  operator: Types.ObjectId

  @Prop({ enum: ['safari', 'beach', 'adventure', 'cultural', 'mountain', 'city', 'daytrip', 'multiday'], required: true })
  category: string

  @Prop({ type: [String], default: [] })
  images: string[]

  @Prop()
  videoUrl?: string

  @Prop({ required: true, min: 0 })
  price: number

  @Prop({ type: [PricingTier] })
  pricingTiers?: PricingTier[]

  @Prop({ default: 'USD', enum: ['USD', 'KES', 'TZS', 'EUR', 'GBP'] })
  currency: string

  @Prop({ required: true })
  duration: string

  @Prop({ required: true, min: 1 })
  groupSize: number

  @Prop({ min: 0 })
  minAge?: number

  @Prop({ default: 0 })
  rating: number

  @Prop({ default: 0 })
  reviewCount: number

  @Prop({ default: false })
  featured: boolean

  @Prop({ default: true })
  instantBooking: boolean

  @Prop({ type: [ItineraryDay], default: [] })
  itinerary: ItineraryDay[]

  @Prop({ type: [String], default: [] })
  includes: string[]

  @Prop({ type: [String], default: [] })
  excludes: string[]

  @Prop({ type: [String], default: [] })
  highlights: string[]

  @Prop({ type: [String], default: [] })
  tags: string[]

  @Prop({ type: [String], default: [] })
  availability: string[]

  @Prop()
  cancellationPolicy?: string

  @Prop({ default: 'active', enum: ['active', 'inactive', 'draft', 'suspended'] })
  status: string

  @Prop({ default: 0 })
  totalBookings: number

  @Prop({ default: false })
  isDeleted: boolean
}

export const TourSchema = SchemaFactory.createForClass(Tour)
TourSchema.index({ destination: 1 })
TourSchema.index({ category: 1 })
TourSchema.index({ price: 1 })
TourSchema.index({ rating: -1 })
TourSchema.index({ featured: 1 })
TourSchema.index({ status: 1, isDeleted: 1 })
TourSchema.index({ slug: 1 }, { unique: true })
TourSchema.index({ title: 'text', description: 'text', tags: 'text' })
