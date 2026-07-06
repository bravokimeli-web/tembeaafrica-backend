import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Guide, GuideSchema } from './schemas/guide.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: Guide.name, schema: GuideSchema }])],
  exports: [MongooseModule],
})
export class GuidesModule {}
