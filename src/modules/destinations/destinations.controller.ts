import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { DestinationsService } from './destinations.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('destinations')
@Controller('destinations')
export class DestinationsController {
  constructor(private destinationsService: DestinationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all destinations with filters' })
  findAll(@Query() query: Record<string, unknown>) { return this.destinationsService.findAll(query) }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured destinations' })
  getFeatured() { return this.destinationsService.findFeatured() }

  @Get('country/:country')
  @ApiOperation({ summary: 'Get destinations by country' })
  getByCountry(@Param('country') country: string) { return this.destinationsService.findByCountry(country) }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a destination by slug' })
  findOne(@Param('slug') slug: string) { return this.destinationsService.findBySlug(slug) }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a destination (admin)' })
  create(@Body() body: Record<string, unknown>) { return this.destinationsService.create(body as any) }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a destination (admin)' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) { return this.destinationsService.update(id, body as any) }
}
