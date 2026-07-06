import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type BookingDocument = Booking & Document

@Schema({ _id: false })
class BookingItem {
  @Prop({ enum: ['tour', 'accommodation', 'guide', 'transport'] }) type: string
  @Prop({ type: Types.ObjectId, refPath: 'items.type' }) itemId: Types.ObjectId
  @Prop() name: string
  @Prop({ min: 1 }) quantity: number
  @Prop({ min: 0 }) price: number
  @Prop() startDate: string
  @Prop() endDate?: string
}

@Schema({ _id: false })
class GuestDetails {
  @Prop() firstName: string
  @Prop() lastName: string
  @Prop() email: string
  @Prop() phone?: string
  @Prop() nationality?: string
  @Prop() specialRequests?: string
}

@Schema({ timestamps: true, collection: 'bookings' })
export class Booking {
  @Prop({ required: true, unique: true })
  bookingNumber: string

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId

  @Prop({ type: [BookingItem], required: true })
  items: BookingItem[]

  @Prop({ type: GuestDetails })
  guestDetails: GuestDetails

  @Prop({ required: true, min: 0 })
  subtotal: number

  @Prop({ default: 0 })
  serviceFee: number

  @Prop({ required: true, min: 0 })
  totalAmount: number

  @Prop({ default: 'USD', enum: ['USD', 'KES', 'TZS', 'EUR', 'GBP'] })
  currency: string

  @Prop({ enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'], default: 'pending' })
  status: string

  @Prop({ enum: ['unpaid', 'paid', 'refunded', 'partially_refunded'], default: 'unpaid' })
  paymentStatus: string

  @Prop()
  paymentMethod?: string

  @Prop()
  paymentReference?: string

  @Prop()
  paymentUrl?: string

  @Prop({ required: true })
  startDate: string

  @Prop()
  endDate?: string

  @Prop({ min: 1, default: 1 })
  guests: number

  @Prop()
  cancellationReason?: string

  @Prop()
  cancelledAt?: Date

  @Prop()
  confirmedAt?: Date

  @Prop({ default: false })
  isDeleted: boolean

  // Commission
  @Prop({ default: 0 })
  commissionAmount: number

  @Prop({ default: 0.10 })
  commissionRate: number
}

export const BookingSchema = SchemaFactory.createForClass(Booking)
BookingSchema.index({ user: 1, createdAt: -1 })
BookingSchema.index({ bookingNumber: 1 }, { unique: true })
BookingSchema.index({ status: 1 })
BookingSchema.index({ paymentStatus: 1 })
BookingSchema.index({ startDate: 1 })
