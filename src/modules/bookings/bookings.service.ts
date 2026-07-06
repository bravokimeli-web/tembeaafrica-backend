import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { Booking, BookingDocument } from './schemas/booking.schema'
import { NotificationsService } from '../notifications/notifications.service'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private notificationsService: NotificationsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, data: Record<string, unknown>) {
    const subtotal = (data.items as any[]).reduce((s: number, i: any) => s + i.price * i.quantity, 0)
    const serviceFee = Math.round(subtotal * 0.08)
    const totalAmount = subtotal + serviceFee
    const commissionAmount = Math.round(subtotal * 0.10)

    const booking = await this.bookingModel.create({
      bookingNumber: 'TA-' + uuidv4().substring(0, 8).toUpperCase(),
      user: userId,
      items: data.items,
      guestDetails: data.guestDetails,
      subtotal,
      serviceFee,
      totalAmount,
      commissionAmount,
      commissionRate: 0.10,
      currency: data.currency || 'USD',
      startDate: data.startDate,
      endDate: data.endDate,
      guests: data.guests || 1,
      paymentMethod: data.paymentMethod,
    })

    this.eventEmitter.emit('booking.created', { booking, userId })
    return booking
  }

  async findMyBookings(userId: string) {
    return this.bookingModel.find({ user: userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .lean()
  }

  async findOne(id: string, userId?: string) {
    const booking = await this.bookingModel.findById(id)
      .populate('user', 'firstName lastName email phone')
      .lean()
    if (!booking) throw new NotFoundException('Booking not found')
    if (userId && booking.user && (booking.user as any)._id?.toString() !== userId) {
      throw new ForbiddenException('Access denied')
    }
    return booking
  }

  async findByNumber(bookingNumber: string) {
    const booking = await this.bookingModel.findOne({ bookingNumber })
      .populate('user', 'firstName lastName email')
      .lean()
    if (!booking) throw new NotFoundException('Booking not found')
    return booking
  }

  async cancel(id: string, userId: string, reason?: string) {
    const booking = await this.bookingModel.findById(id)
    if (!booking) throw new NotFoundException('Booking not found')
    if (booking.user.toString() !== userId) throw new ForbiddenException('Access denied')
    if (['cancelled', 'completed'].includes(booking.status)) {
      throw new BadRequestException(`Cannot cancel a ${booking.status} booking`)
    }

    booking.status = 'cancelled'
    booking.cancellationReason = reason || 'Cancelled by guest'
    booking.cancelledAt = new Date()
    await booking.save()

    this.eventEmitter.emit('booking.cancelled', { booking })
    return booking
  }

  async confirm(id: string, paymentReference: string) {
    const booking = await this.bookingModel.findByIdAndUpdate(id, {
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentReference,
      confirmedAt: new Date(),
    }, { new: true }).populate('user', 'firstName lastName email')

    if (!booking) throw new NotFoundException('Booking not found')
    this.eventEmitter.emit('booking.confirmed', { booking })

    await this.notificationsService.sendBookingConfirmation(
      (booking.user as any).email,
      (booking.user as any).firstName,
      booking.bookingNumber,
      booking.totalAmount,
    ).catch(() => null)

    return booking
  }

  async complete(id: string) {
    return this.bookingModel.findByIdAndUpdate(id, { status: 'completed' }, { new: true })
  }

  // Admin
  async findAll(query: Record<string, unknown>) {
    const { page = 1, limit = 20, status, paymentStatus, startDate, endDate } = query
    const skip = ((page as number) - 1) * (limit as number)
    const filter: Record<string, unknown> = { isDeleted: false }
    if (status) filter.status = status
    if (paymentStatus) filter.paymentStatus = paymentStatus
    if (startDate && endDate) filter.createdAt = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) }

    const [data, total] = await Promise.all([
      this.bookingModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit as number)
        .populate('user', 'firstName lastName email avatar').lean(),
      this.bookingModel.countDocuments(filter),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / (limit as number)) }
  }

  async getStats() {
    const [totalRevenue, totalBookings, pendingBookings, confirmedBookings] = await Promise.all([
      this.bookingModel.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' }, commission: { $sum: '$commissionAmount' } } }]),
      this.bookingModel.countDocuments({ isDeleted: false }),
      this.bookingModel.countDocuments({ status: 'pending' }),
      this.bookingModel.countDocuments({ status: 'confirmed' }),
    ])
    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalCommission: totalRevenue[0]?.commission || 0,
      totalBookings,
      pendingBookings,
      confirmedBookings,
    }
  }

  async getMonthlyRevenue() {
    return this.bookingModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ])
  }
}
