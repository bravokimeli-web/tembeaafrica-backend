import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { User, UserSchema } from '../users/schemas/user.schema'
import { Tour, TourSchema } from '../tours/schemas/tour.schema'
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema'
import { Review, ReviewSchema } from '../reviews/schemas/review.schema'
import { Destination, DestinationSchema } from '../destinations/schemas/destination.schema'
import { Accommodation, AccommodationSchema } from '../accommodations/schemas/accommodation.schema'
import { Guide, GuideSchema } from '../guides/schemas/guide.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Tour.name, schema: TourSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Destination.name, schema: DestinationSchema },
      { name: Accommodation.name, schema: AccommodationSchema },
      { name: Guide.name, schema: GuideSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
