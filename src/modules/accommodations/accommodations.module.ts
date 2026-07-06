import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Accommodation, AccommodationSchema } from './schemas/accommodation.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: Accommodation.name, schema: AccommodationSchema }])],
  exports: [MongooseModule],
})
export class AccommodationsModule {}
