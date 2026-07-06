import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ReviewsService } from './reviews.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review' })
  create(@CurrentUser() user: { userId: string }, @Body() body: any) {
    return this.reviewsService.create(user.userId, body)
  }

  @Get(':targetType/:targetId')
  @ApiOperation({ summary: 'Get reviews for a listing' })
  findForTarget(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Query('page') page?: number,
  ) {
    return this.reviewsService.findForTarget(targetType, targetId, page)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review' })
  update(@Param('id') id: string, @CurrentUser() user: { userId: string }, @Body() body: any) {
    return this.reviewsService.update(id, user.userId, body)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  remove(@Param('id') id: string, @CurrentUser() user: { userId: string; role: string }) {
    return this.reviewsService.delete(id, user.userId, user.role === 'admin')
  }
}
