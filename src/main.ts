import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false })

  // Security
  app.use(helmet())
  app.use(compression())
  app.use(morgan('combined'))

  // CORS
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://tembeaafrica.com',
      'https://www.tembeaafrica.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })

  // Global prefix
  app.setGlobalPrefix('api')

  // Validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }))

  // Swagger API docs
  const config = new DocumentBuilder()
    .setTitle('Tembea Africa API')
    .setDescription("Africa's leading travel marketplace REST API")
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('destinations', 'Travel destinations')
    .addTag('tours', 'Tours and safaris')
    .addTag('accommodations', 'Hotels, BnBs, lodges')
    .addTag('guides', 'Local guide marketplace')
    .addTag('transport', 'Transportation services')
    .addTag('bookings', 'Booking management')
    .addTag('payments', 'Payment processing')
    .addTag('reviews', 'Reviews and ratings')
    .addTag('messaging', 'Real-time messaging')
    .addTag('ai-planner', 'AI itinerary generation')
    .addTag('admin', 'Admin panel')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`🌍 Tembea Africa API running on: http://localhost:${port}/api`)
  console.log(`📚 Swagger docs at: http://localhost:${port}/api/docs`)
  console.log(`💡 To seed database via API: POST http://localhost:${port}/api/admin/seed (requires admin auth)\n`)
}
bootstrap()
