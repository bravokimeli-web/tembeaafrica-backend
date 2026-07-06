import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AiPlannerService } from './ai-planner.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { Throttle } from '@nestjs/throttler'

@ApiTags('ai-planner')
@Controller('ai-planner')
export class AiPlannerController {
  constructor(private aiPlannerService: AiPlannerService) {}

  @Post('generate')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Generate an AI travel itinerary' })
  generate(@Body() body: { destination: string; duration: number; budget: string; interests: string[]; travelStyle: string; guests: number; startDate?: string }) {
    return this.aiPlannerService.generateItinerary(body)
  }
}
