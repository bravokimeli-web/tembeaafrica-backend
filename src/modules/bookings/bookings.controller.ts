import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { BookingsService } from './bookings.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  create(@CurrentUser() user: { userId: string }, @Body() body: Record<string, unknown>) {
    return this.bookingsService.create(user.userId, body)
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my bookings' })
  getMyBookings(@CurrentUser() user: { userId: string }) {
    return this.bookingsService.findMyBookings(user.userId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: { userId: string; role: string }) {
    return this.bookingsService.findOne(id, user.role === 'admin' ? undefined : user.userId)
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body('reason') reason: string,
  ) {
    return this.bookingsService.cancel(id, user.userId, reason)
  }
}
