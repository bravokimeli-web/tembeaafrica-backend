import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ToursService } from './tours.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('tours')
@Controller('tours')
export class ToursController {
  constructor(private toursService: ToursService) {}

  @Get()
  @ApiOperation({ summary: 'List all tours with filters' })
  findAll(@Query() query: Record<string, unknown>) { return this.toursService.findAll(query as any) }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured tours' })
  getFeatured() { return this.toursService.findFeatured() }

  @Get('destination/:id')
  @ApiOperation({ summary: 'Get tours by destination' })
  getByDestination(@Param('id') id: string) { return this.toursService.findByDestination(id) }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a tour by slug' })
  findOne(@Param('slug') slug: string) { return this.toursService.findBySlug(slug) }

  @Post(':id/check-availability')
  @ApiOperation({ summary: 'Check tour availability' })
  checkAvailability(@Param('id') id: string, @Body() body: { date: string; guests: number }) {
    return this.toursService.checkAvailability(id, body.date, body.guests)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  @ApiBearerAuth()
  create(@Body() body: Record<string, unknown>) { return this.toursService.create(body as any) }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'operator')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) { return this.toursService.update(id, body as any) }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  remove(@Param('id') id: string) { return this.toursService.delete(id) }
}
