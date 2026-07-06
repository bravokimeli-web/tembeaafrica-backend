import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type UserDocument = User & Document

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true, maxlength: 50 })
  firstName: string

  @Prop({ required: true, trim: true, maxlength: 50 })
  lastName: string

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string

  @Prop({ required: true, select: false, minlength: 8 })
  password: string

  @Prop()
  phone?: string

  @Prop()
  avatar?: string

  @Prop({ enum: ['tourist', 'guide', 'operator', 'admin'], default: 'tourist' })
  role: string

  @Prop()
  nationality?: string

  @Prop({ default: false })
  isVerified: boolean

  @Prop({ default: false })
  isBanned: boolean

  @Prop()
  googleId?: string

  @Prop()
  facebookId?: string

  @Prop({ select: false })
  passwordResetToken?: string

  @Prop({ select: false })
  passwordResetExpires?: Date

  @Prop()
  lastLoginAt?: Date

  @Prop({ type: [String], default: [] })
  wishlist: string[]

  @Prop({ type: Object })
  preferences?: {
    currency?: string
    language?: string
    notifications?: boolean
    newsletter?: boolean
  }

  // Virtual
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }
}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.index({ email: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ createdAt: -1 })

UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})
