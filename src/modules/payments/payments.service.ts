import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { BookingsService } from '../bookings/bookings.service'

@Injectable()
export class PaymentsService {
  private paystackSecret: string
  private paypalClientId: string
  private paypalSecret: string
  private paypalBaseUrl: string

  constructor(
    private configService: ConfigService,
    private bookingsService: BookingsService,
  ) {
    this.paystackSecret = configService.get('PAYSTACK_SECRET_KEY', '')
    this.paypalClientId = configService.get('PAYPAL_CLIENT_ID', '')
    this.paypalSecret = configService.get('PAYPAL_SECRET', '')
    this.paypalBaseUrl = configService.get('PAYPAL_MODE', 'sandbox') === 'live'
      ? 'https://api.paypal.com'
      : 'https://api.sandbox.paypal.com'
  }

  async initiatePaystackPayment(bookingId: string, email: string) {
    const booking = await this.bookingsService.findOne(bookingId)
    if (!booking) throw new NotFoundException('Booking not found')

    const amountKobo = Math.round(booking.totalAmount * 100) // Paystack uses kobo

    try {
      const { data } = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email,
          amount: amountKobo,
          currency: 'USD',
          reference: booking.bookingNumber,
          callback_url: `${this.configService.get('FRONTEND_URL')}/checkout/success`,
          metadata: {
            bookingId: bookingId,
            bookingNumber: booking.bookingNumber,
            custom_fields: [
              { display_name: 'Booking Number', variable_name: 'booking_number', value: booking.bookingNumber },
            ],
          },
        },
        { headers: { Authorization: `Bearer ${this.paystackSecret}`, 'Content-Type': 'application/json' } },
      )
      return { paymentUrl: data.data.authorization_url, reference: data.data.reference, provider: 'paystack' }
    } catch (error: any) {
      throw new BadRequestException(error.response?.data?.message || 'Failed to initialize Paystack payment')
    }
  }

  async verifyPaystackPayment(reference: string) {
    try {
      const { data } = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        { headers: { Authorization: `Bearer ${this.paystackSecret}` } },
      )

      if (data.data.status !== 'success') throw new BadRequestException('Payment not successful')

      const booking = await this.bookingsService.findByNumber(reference)
      await this.bookingsService.confirm(booking._id.toString(), reference)
      return { success: true, booking, message: 'Payment verified and booking confirmed' }
    } catch (error: any) {
      throw new BadRequestException(error.response?.data?.message || 'Payment verification failed')
    }
  }

  async initiatePaypalPayment(bookingId: string) {
    const booking = await this.bookingsService.findOne(bookingId)
    if (!booking) throw new NotFoundException('Booking not found')

    const accessToken = await this.getPaypalAccessToken()

    try {
      const { data } = await axios.post(
        `${this.paypalBaseUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: booking.bookingNumber,
            amount: { currency_code: 'USD', value: booking.totalAmount.toFixed(2) },
            description: `Tembea Africa Booking ${booking.bookingNumber}`,
          }],
          application_context: {
            return_url: `${this.configService.get('FRONTEND_URL')}/checkout/success?provider=paypal&bookingId=${bookingId}`,
            cancel_url: `${this.configService.get('FRONTEND_URL')}/checkout?cancelled=true`,
          },
        },
        { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } },
      )

      const approvalLink = data.links.find((l: any) => l.rel === 'approve')
      return { paymentUrl: approvalLink?.href, orderId: data.id, provider: 'paypal' }
    } catch (error: any) {
      throw new BadRequestException('Failed to initialize PayPal payment')
    }
  }

  async capturePaypalPayment(orderId: string, bookingId: string) {
    const accessToken = await this.getPaypalAccessToken()

    try {
      const { data } = await axios.post(
        `${this.paypalBaseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } },
      )

      if (data.status === 'COMPLETED') {
        await this.bookingsService.confirm(bookingId, orderId)
        return { success: true, message: 'PayPal payment captured and booking confirmed' }
      }
      throw new BadRequestException('PayPal payment not completed')
    } catch (error: any) {
      throw new BadRequestException('Failed to capture PayPal payment')
    }
  }

  async handleWebhook(provider: string, payload: Record<string, unknown>, signature: string) {
    if (provider === 'paystack') {
      // Verify Paystack webhook signature
      const crypto = await import('crypto')
      const hash = crypto.createHmac('sha512', this.paystackSecret).update(JSON.stringify(payload)).digest('hex')
      if (hash !== signature) throw new BadRequestException('Invalid webhook signature')

      const event = payload.event as string
      const data = payload.data as Record<string, unknown>

      if (event === 'charge.success') {
        const reference = data.reference as string
        const booking = await this.bookingsService.findByNumber(reference).catch(() => null)
        if (booking) await this.bookingsService.confirm(booking._id.toString(), reference)
      }
    }
    return { received: true }
  }

  private async getPaypalAccessToken(): Promise<string> {
    const credentials = Buffer.from(`${this.paypalClientId}:${this.paypalSecret}`).toString('base64')
    const { data } = await axios.post(
      `${this.paypalBaseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      { headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' } },
    )
    return data.access_token
  }
}
