import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from '../users/schemas/user.schema'
import { Tour, TourDocument } from '../tours/schemas/tour.schema'
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema'
import { Review, ReviewDocument } from '../reviews/schemas/review.schema'

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Tour.name) private tourModel: Model<TourDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async getDashboardStats() {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalUsers, newUsersThisMonth, newUsersLastMonth,
      totalBookings, bookingsThisMonth, bookingsLastMonth,
      revenueResult, revenueLastMonthResult,
      totalTours, totalReviews,
      bookingsByStatus, revenueByMonth,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      this.userModel.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      this.bookingModel.countDocuments({ isDeleted: false }),
      this.bookingModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      this.bookingModel.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      this.bookingModel.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' }, commission: { $sum: '$commissionAmount' } } }]),
      this.bookingModel.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      this.tourModel.countDocuments({ isDeleted: false }),
      this.reviewModel.countDocuments({ isDeleted: false }),
      this.bookingModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      this.bookingModel.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } } },
        { $group: { _id: { month: { $month: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, bookings: { $sum: 1 } } },
        { $sort: { '_id.month': 1 } },
      ]),
    ])

    const revenue = revenueResult[0]?.total || 0
    const revenueLastMonth = revenueLastMonthResult[0]?.total || 0
    const revenueGrowth = revenueLastMonth > 0 ? ((revenue - revenueLastMonth) / revenueLastMonth) * 100 : 0

    return {
      users: { total: totalUsers, thisMonth: newUsersThisMonth, growth: newUsersLastMonth > 0 ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 : 0 },
      bookings: { total: totalBookings, thisMonth: bookingsThisMonth, growth: bookingsLastMonth > 0 ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100 : 0 },
      revenue: { thisMonth: revenue, commission: revenueResult[0]?.commission || 0, growth: revenueGrowth },
      listings: { tours: totalTours, reviews: totalReviews },
      bookingsByStatus: Object.fromEntries(bookingsByStatus.map((b: any) => [b._id, b.count])),
      revenueByMonth,
    }
  }

  async getUsers(query: Record<string, unknown>) {
    const { page = 1, limit = 20, role, q, banned } = query
    const skip = ((page as number) - 1) * (limit as number)
    const filter: Record<string, unknown> = {}
    if (role) filter.role = role
    if (banned !== undefined) filter.isBanned = banned === 'true'
    if (q) filter.$or = [
      { firstName: new RegExp(q as string, 'i') },
      { lastName: new RegExp(q as string, 'i') },
      { email: new RegExp(q as string, 'i') },
    ]
    const [data, total] = await Promise.all([
      this.userModel.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit as number).lean(),
      this.userModel.countDocuments(filter),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / (limit as number)) }
  }

  async banUser(id: string, banned: boolean) {
    return this.userModel.findByIdAndUpdate(id, { isBanned: banned }, { new: true }).select('-password')
  }

  async updateUserRole(id: string, role: string) {
    return this.userModel.findByIdAndUpdate(id, { role }, { new: true }).select('-password')
  }

  async getBookings(query: Record<string, unknown>) {
    const { page = 1, limit = 20, status } = query
    const skip = ((page as number) - 1) * (limit as number)
    const filter: Record<string, unknown> = { isDeleted: false }
    if (status) filter.status = status
    const [data, total] = await Promise.all([
      this.bookingModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit as number)
        .populate('user', 'firstName lastName email avatar').lean(),
      this.bookingModel.countDocuments(filter),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / (limit as number)) }
  }

  async updateBookingStatus(id: string, status: string) {
    return this.bookingModel.findByIdAndUpdate(id, { status }, { new: true }).populate('user', 'firstName lastName email')
  }

  async getReviews(query: Record<string, unknown>) {
    const { page = 1, limit = 20, approved } = query
    const skip = ((page as number) - 1) * (limit as number)
    const filter: Record<string, unknown> = { isDeleted: false }
    if (approved !== undefined) filter.approved = approved === 'true'
    const [data, total] = await Promise.all([
      this.reviewModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit as number)
        .populate('user', 'firstName lastName email').lean(),
      this.reviewModel.countDocuments(filter),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / (limit as number)) }
  }

  async approveReview(id: string) {
    return this.reviewModel.findByIdAndUpdate(id, { approved: true }, { new: true })
  }

  async deleteReview(id: string) {
    return this.reviewModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true })
  }
}
