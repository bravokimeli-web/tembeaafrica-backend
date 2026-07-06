import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Destination, DestinationSchema } from './schemas/destination.schema'
import { DestinationsController } from './destinations.controller'
import { DestinationsService } from './destinations.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: Destination.name, schema: DestinationSchema }])],
  controllers: [DestinationsController],
  providers: [DestinationsService],
  exports: [DestinationsService],
})
export class DestinationsModule {}
