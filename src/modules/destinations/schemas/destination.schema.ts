import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type DestinationDocument = Destination & Document

@Schema({ _id: false })
class Coordinates {
  @Prop({ required: true }) lat: number
  @Prop({ required: true }) lng: number
}

@Schema({ timestamps: true, collection: 'destinations' })
export class Destination {
  @Prop({ required: true, trim: true }) name: string
  @Prop({ required: true, unique: true, lowercase: true }) slug: string
  @Prop({ enum: ['kenya', 'tanzania'], required: true }) country: string
  @Prop() county?: string
  @Prop({ required: true }) description: string
  @Prop() shortDescription?: string
  @Prop({ required: true }) heroImage: string
  @Prop({ type: [String], default: [] }) images: string[]
  @Prop({ type: Coordinates }) coordinates: Coordinates
  @Prop({ default: 0, min: 0, max: 5 }) rating: number
  @Prop({ default: 0 }) reviewCount: number
  @Prop({ default: 0 }) tourCount: number
  @Prop({ default: 0 }) hotelCount: number
  @Prop({ type: [String], default: [] }) tags: string[]
  @Prop() bestTimeToVisit?: string
  @Prop({ default: false }) featured: boolean
  @Prop({ default: 'active', enum: ['active', 'inactive'] }) status: string
  @Prop({ default: false }) isDeleted: boolean
  @Prop() travelTips?: string
  @Prop() visaInfo?: string
}

export const DestinationSchema = SchemaFactory.createForClass(Destination)
DestinationSchema.index({ country: 1 })
DestinationSchema.index({ featured: 1 })
DestinationSchema.index({ rating: -1 })
DestinationSchema.index({ slug: 1 }, { unique: true })
DestinationSchema.index({ name: 'text', description: 'text', tags: 'text' })
