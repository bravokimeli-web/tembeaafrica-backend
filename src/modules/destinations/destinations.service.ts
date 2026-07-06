import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, FilterQuery } from 'mongoose'
import { Destination, DestinationDocument } from './schemas/destination.schema'

@Injectable()
export class DestinationsService {
  constructor(@InjectModel(Destination.name) private destModel: Model<DestinationDocument>) {}

  async findAll(query: Record<string, unknown>) {
    const { page = 1, limit = 20, country, q, sort = 'rating' } = query
    const skip = ((page as number) - 1) * (limit as number)
    const filter: FilterQuery<DestinationDocument> = { status: 'active', isDeleted: false }
    if (country) filter.country = country
    if (q) filter.$text = { $search: q as string }
    const sortMap: Record<string, Record<string, 1 | -1>> = { rating: { rating: -1 }, name: { name: 1 }, newest: { createdAt: -1 } }
    const [data, total] = await Promise.all([
      this.destModel.find(filter).sort(sortMap[sort as string] || { rating: -1 }).skip(skip).limit(limit as number).lean(),
      this.destModel.countDocuments(filter),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / (limit as number)) }
  }

  async findFeatured() {
    const data = await this.destModel.find({ featured: true, status: 'active', isDeleted: false }).sort({ rating: -1 }).limit(8).lean()
    return { data }
  }

  async findBySlug(slug: string) {
    const dest = await this.destModel.findOne({ slug, isDeleted: false }).lean()
    if (!dest) throw new NotFoundException(`Destination '${slug}' not found`)
    return dest
  }

  async findByCountry(country: string) {
    return this.destModel.find({ country, status: 'active', isDeleted: false }).sort({ featured: -1, rating: -1 }).lean()
  }

  async create(data: Partial<Destination>) {
    const slug = (data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return this.destModel.create({ ...data, slug })
  }

  async update(id: string, data: Partial<Destination>) {
    const dest = await this.destModel.findByIdAndUpdate(id, data, { new: true })
    if (!dest) throw new NotFoundException('Destination not found')
    return dest
  }
}
