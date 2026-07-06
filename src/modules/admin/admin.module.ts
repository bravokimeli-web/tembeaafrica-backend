import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { User, UserSchema } from '../users/schemas/user.schema'
import { Tour, TourSchema } from '../tours/schemas/tour.schema'
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema'
import { Review, ReviewSchema } from '../reviews/schemas/review.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Tour.name, schema: TourSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
