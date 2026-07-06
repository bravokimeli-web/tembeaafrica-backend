import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, FilterQuery } from 'mongoose'
import { Tour, TourDocument } from './schemas/tour.schema'

export interface ToursQuery {
  page?: number
  limit?: number
  destination?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  country?: string
  q?: string
  sort?: string
  featured?: boolean
  instantBooking?: boolean
}

@Injectable()
export class ToursService {
  constructor(@InjectModel(Tour.name) private tourModel: Model<TourDocument>) {}

  async findAll(query: ToursQuery) {
    const { page = 1, limit = 12, destination, category, minPrice, maxPrice, rating, q, sort = 'rating', featured, instantBooking } = query
    const skip = (page - 1) * limit
    const filter: FilterQuery<TourDocument> = { status: 'active', isDeleted: false }

    if (destination) filter.destination = destination
    if (category) filter.category = category
    if (featured !== undefined) filter.featured = featured
    if (instantBooking !== undefined) filter.instantBooking = instantBooking
    if (minPrice || maxPrice) filter.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) }
    if (rating) filter.rating = { $gte: Number(rating) }
    if (q) filter.$text = { $search: q }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      rating: { rating: -1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      newest: { createdAt: -1 },
      popular: { totalBookings: -1 },
    }
    const sortObj = sortMap[sort] || { rating: -1 }

    const [data, total] = await Promise.all([
      this.tourModel.find(filter).sort(sortObj).skip(skip).limit(limit)
        .populate('destination', 'name slug country heroImage')
        .populate('operator', 'firstName lastName avatar')
        .lean(),
      this.tourModel.countDocuments(filter),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findFeatured() {
    const data = await this.tourModel.find({ featured: true, status: 'active', isDeleted: false })
      .sort({ rating: -1 }).limit(9)
      .populate('destination', 'name slug country heroImage')
      .populate('operator', 'firstName lastName avatar')
      .lean()
    return { data }
  }

  async findBySlug(slug: string) {
    const tour = await this.tourModel.findOne({ slug, isDeleted: false })
      .populate('destination', 'name slug country heroImage coordinates description')
      .populate('operator', 'firstName lastName avatar email phone')
      .lean()
    if (!tour) throw new NotFoundException(`Tour '${slug}' not found`)
    return tour
  }

  async findById(id: string) {
    const tour = await this.tourModel.findById(id).populate('destination operator').lean()
    if (!tour) throw new NotFoundException('Tour not found')
    return tour
  }

  async findByDestination(destinationId: string, limit = 6) {
    return this.tourModel.find({ destination: destinationId, status: 'active', isDeleted: false })
      .sort({ rating: -1 }).limit(limit)
      .populate('operator', 'firstName lastName avatar')
      .lean()
  }

  async checkAvailability(tourId: string, date: string, guests: number) {
    const tour = await this.tourModel.findById(tourId)
    if (!tour) throw new NotFoundException('Tour not found')
    if (guests > tour.groupSize) throw new BadRequestException(`Maximum group size is ${tour.groupSize}`)
    const isAvailable = tour.availability.length === 0 || tour.availability.includes(date)
    return { available: isAvailable, date, guests, price: tour.price * guests, tourId }
  }

  async create(data: Partial<Tour>) {
    const slug = this.generateSlug(data.title!)
    const tour = await this.tourModel.create({ ...data, slug })
    return tour
  }

  async update(id: string, data: Partial<Tour>) {
    const tour = await this.tourModel.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    if (!tour) throw new NotFoundException('Tour not found')
    return tour
  }

  async delete(id: string) {
    await this.tourModel.findByIdAndUpdate(id, { isDeleted: true })
    return { message: 'Tour deleted successfully' }
  }

  async updateRating(tourId: string, newRating: number, reviewCount: number) {
    await this.tourModel.findByIdAndUpdate(tourId, { rating: newRating, reviewCount })
  }

  async incrementBookings(tourId: string) {
    await this.tourModel.findByIdAndUpdate(tourId, { $inc: { totalBookings: 1 } })
  }

  private generateSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()
  }
}
