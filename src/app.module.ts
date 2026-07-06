import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { ThrottlerModule } from '@nestjs/throttler'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'

import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { DestinationsModule } from './modules/destinations/destinations.module'
import { AccommodationsModule } from './modules/accommodations/accommodations.module'
import { ToursModule } from './modules/tours/tours.module'
import { GuidesModule } from './modules/guides/guides.module'
import { TransportModule } from './modules/transport/transport.module'
import { BookingsModule } from './modules/bookings/bookings.module'
import { PaymentsModule } from './modules/payments/payments.module'
import { ReviewsModule } from './modules/reviews/reviews.module'
import { MessagingModule } from './modules/messaging/messaging.module'
import { AiPlannerModule } from './modules/ai-planner/ai-planner.module'
import { AdminModule } from './modules/admin/admin.module'
import { NotificationsModule } from './modules/notifications/notifications.module'

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://localhost:27017/tembea-africa'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectionFactory: (connection) => {
          console.log('✅ MongoDB connected')
          return connection
        },
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Events
    EventEmitterModule.forRoot(),

    // Scheduling
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    UsersModule,
    DestinationsModule,
    AccommodationsModule,
    ToursModule,
    GuidesModule,
    TransportModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    MessagingModule,
    AiPlannerModule,
    AdminModule,
    NotificationsModule,
  ],
})
export class AppModule {}
