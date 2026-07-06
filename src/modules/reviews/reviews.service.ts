import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Review, ReviewDocument } from './schemas/review.schema'

@Injectable()
export class ReviewsService {
  constructor(@InjectModel(Review.name) private reviewModel: Model<ReviewDocument>) {}

  async create(userId: string, data: { targetType: string; targetId: string; rating: number; title: string; body: string; images?: string[] }) {
    const existing = await this.reviewModel.findOne({ user: userId, targetType: data.targetType, targetId: data.targetId })
    if (existing) throw new BadRequestException('You have already reviewed this item')

    const review = await this.reviewModel.create({ ...data, user: userId })
    await this.recalculateRating(data.targetType, data.targetId)
    return review
  }

  async findForTarget(targetType: string, targetId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit
    const filter = { targetType, targetId, approved: true, isDeleted: false }
    const [data, total] = await Promise.all([
      this.reviewModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('user', 'firstName lastName avatar nationality').lean(),
      this.reviewModel.countDocuments(filter),
    ])
    const avgRating = await this.reviewModel.aggregate([
      { $match: filter },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / limit), avgRating: avgRating[0]?.avg || 0 }
  }

  async update(id: string, userId: string, data: Partial<Review>) {
    const review = await this.reviewModel.findById(id)
    if (!review) throw new NotFoundException('Review not found')
    if (review.user.toString() !== userId) throw new ForbiddenException('Not your review')
    Object.assign(review, data)
    return review.save()
  }

  async delete(id: string, userId: string, isAdmin = false) {
    const review = await this.reviewModel.findById(id)
    if (!review) throw new NotFoundException('Review not found')
    if (!isAdmin && review.user.toString() !== userId) throw new ForbiddenException('Not your review')
    review.isDeleted = true
    await review.save()
    await this.recalculateRating(review.targetType, review.targetId)
    return { message: 'Review deleted' }
  }

  async findAll(query: Record<string, unknown>) {
    const { page = 1, limit = 20, approved, targetType } = query
    const skip = ((page as number) - 1) * (limit as number)
    const filter: Record<string, unknown> = { isDeleted: false }
    if (approved !== undefined) filter.approved = approved === 'true'
    if (targetType) filter.targetType = targetType

    const [data, total] = await Promise.all([
      this.reviewModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit as number)
        .populate('user', 'firstName lastName email').lean(),
      this.reviewModel.countDocuments(filter),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / (limit as number)) }
  }

  async approve(id: string) {
    return this.reviewModel.findByIdAndUpdate(id, { approved: true }, { new: true })
  }

  private async recalculateRating(targetType: string, targetId: string) {
    const result = await this.reviewModel.aggregate([
      { $match: { targetType, targetId, approved: true, isDeleted: false } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ])
    return { avg: result[0]?.avg || 0, count: result[0]?.count || 0 }
  }
}
