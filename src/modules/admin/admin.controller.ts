import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getStats() { return this.adminService.getDashboardStats() }

  @Post('seed')
  @ApiOperation({ summary: 'Seed database with initial test data (admin only, idempotent)' })
  seedDatabase() { return this.adminService.seedDatabase() }

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  getUsers(@Query() query: Record<string, unknown>) { return this.adminService.getUsers(query) }

  @Patch('users/:id/ban')
  @ApiOperation({ summary: 'Ban or unban a user' })
  banUser(@Param('id') id: string, @Body('banned') banned: boolean) { return this.adminService.banUser(id, banned) }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  updateRole(@Param('id') id: string, @Body('role') role: string) { return this.adminService.updateUserRole(id, role) }

  @Get('bookings')
  @ApiOperation({ summary: 'List all bookings' })
  getBookings(@Query() query: Record<string, unknown>) { return this.adminService.getBookings(query) }

  @Patch('bookings/:id/status')
  @ApiOperation({ summary: 'Update booking status' })
  updateBookingStatus(@Param('id') id: string, @Body('status') status: string) { return this.adminService.updateBookingStatus(id, status) }

  @Get('reviews')
  @ApiOperation({ summary: 'List all reviews' })
  getReviews(@Query() query: Record<string, unknown>) { return this.adminService.getReviews(query) }

  @Patch('reviews/:id/approve')
  @ApiOperation({ summary: 'Approve a review' })
  approveReview(@Param('id') id: string) { return this.adminService.approveReview(id) }

  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Delete a review' })
  deleteReview(@Param('id') id: string) { return this.adminService.deleteReview(id) }
}
