import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

interface PlannerRequest {
  destination: string
  duration: number
  budget: string
  interests: string[]
  travelStyle: string
  guests: number
  startDate?: string
}

@Injectable()
export class AiPlannerService {
  constructor(private configService: ConfigService) {}

  async generateItinerary(data: PlannerRequest) {
    const prompt = this.buildPrompt(data)

    // Try Anthropic Claude API
    const anthropicKey = this.configService.get('ANTHROPIC_API_KEY')
    if (anthropicKey) {
      try {
        const { data: response } = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4000,
            messages: [{ role: 'user', content: prompt }],
            system: `You are an expert African travel planner for Tembea Africa platform. You create detailed, practical, and exciting travel itineraries for Kenya and Tanzania. Always respond with valid JSON only, no markdown or explanation.`,
          },
          {
            headers: {
              'x-api-key': anthropicKey,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json',
            },
          },
        )
        const content = response.content[0]?.text || ''
        const cleaned = content.replace(/```json|```/g, '').trim()
        return JSON.parse(cleaned)
      } catch (err) {
        console.error('Claude API error, using fallback', err)
      }
    }

    // Fallback: generate structured itinerary without external API
    return this.generateFallbackItinerary(data)
  }

  private buildPrompt(data: PlannerRequest): string {
    return `Generate a detailed ${data.duration}-day travel itinerary for ${data.destination} for ${data.guests} guest(s).
Budget: ${data.budget} per person
Travel style: ${data.travelStyle}
Interests: ${data.interests.join(', ')}
${data.startDate ? `Start date: ${data.startDate}` : ''}

Return ONLY a JSON object with this exact structure:
{
  "summary": "Brief overview paragraph",
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        { "time": "08:00", "activity": "name", "location": "place", "duration": "2 hours", "cost": 50, "notes": "tip" }
      ],
      "accommodation": "Hotel/lodge name",
      "accommodationCost": 150,
      "transport": "Transport description",
      "meals": ["Breakfast at hotel", "Lunch at bush", "Dinner at camp"],
      "tips": "Practical tip for the day"
    }
  ],
  "totalCost": {
    "accommodation": 0,
    "tours": 0,
    "transport": 0,
    "meals": 0,
    "total": 0
  },
  "packingList": ["Item 1", "Item 2"],
  "bestTimeToVisit": "Months",
  "weatherNotes": "What to expect",
  "visaInfo": "Visa requirements",
  "healthTips": ["Tip 1", "Tip 2"]
}`
  }

  private generateFallbackItinerary(data: PlannerRequest) {
    const isLuxury = data.budget.includes('5,000') || data.travelStyle === 'Luxury'
    const isBudget = data.budget.includes('500') || data.travelStyle === 'Budget'
    const accommodation = isLuxury ? 'Safari Luxury Lodge' : isBudget ? 'Budget Camp' : 'Mid-range Safari Camp'
    const accommodationCost = isLuxury ? 350 : isBudget ? 60 : 150

    const days = Array.from({ length: data.duration }, (_, i) => ({
      day: i + 1,
      title: i === 0 ? `Arrival in ${data.destination}` : i === data.duration - 1 ? 'Departure Day' : `Day ${i + 1} — Wildlife & Exploration`,
      activities: i === 0 ? [
        { time: '14:00', activity: 'Airport transfer & hotel check-in', location: data.destination, duration: '2 hours', cost: 40, notes: 'Private transfer recommended' },
        { time: '17:00', activity: 'Orientation briefing & sundowners', location: 'Lodge viewpoint', duration: '1.5 hours', cost: 20 },
        { time: '19:30', activity: 'Welcome dinner', location: 'Lodge restaurant', duration: '2 hours', cost: 45 },
      ] : i === data.duration - 1 ? [
        { time: '07:00', activity: 'Final sunrise breakfast', location: 'Lodge', duration: '1 hour', cost: 0 },
        { time: '09:00', activity: 'Souvenir shopping at local market', location: 'Town market', duration: '2 hours', cost: 30 },
        { time: '14:00', activity: 'Airport transfer', location: 'Airport', duration: '2 hours', cost: 40 },
      ] : [
        { time: '06:30', activity: 'Early morning game drive', location: `${data.destination} reserve`, duration: '4 hours', cost: 120, notes: 'Best time for Big Five sightings' },
        { time: '12:00', activity: 'Bush picnic lunch', location: 'Scenic viewpoint', duration: '1.5 hours', cost: 25 },
        { time: '16:00', activity: 'Afternoon game drive', location: 'River crossing area', duration: '3 hours', cost: 0, notes: 'Included in day package' },
        { time: '19:30', activity: 'Campfire dinner under the stars', location: 'Camp boma', duration: '2 hours', cost: 50 },
      ],
      accommodation,
      accommodationCost,
      transport: i === 0 ? 'Private airport transfer (4WD)' : 'Shared safari vehicle (Land Cruiser)',
      meals: ['Full breakfast at lodge', 'Bush lunch included', 'Three-course dinner at camp'],
      tips: [
        'Bring binoculars and wear neutral earth-tone clothing',
        'Stay hydrated — carry at least 2L of water per day',
        'Ask your guide about optimal wildlife viewing spots',
        'Golden hour (6–8am and 4–6pm) is best for photography',
      ][i % 4],
    }))

    const totalAccommodation = accommodationCost * data.duration * data.guests
    const totalTours = 185 * (data.duration - 1) * data.guests
    const totalTransport = 80 * data.duration * data.guests
    const totalMeals = 45 * data.duration * data.guests

    return {
      summary: `A ${data.duration}-day ${data.travelStyle.toLowerCase()} adventure in ${data.destination} for ${data.guests} traveller${data.guests > 1 ? 's' : ''}, focusing on ${data.interests.slice(0, 2).join(' and ')}. This itinerary has been curated to deliver the best of African wildlife and culture within your ${data.budget} budget.`,
      days,
      totalCost: { accommodation: totalAccommodation, tours: totalTours, transport: totalTransport, meals: totalMeals, total: totalAccommodation + totalTours + totalTransport + totalMeals },
      packingList: ['Binoculars', 'Sunscreen SPF50+', 'Insect repellent', 'Light layers for cool mornings', 'Comfortable walking shoes', 'Camera with zoom lens', 'Reusable water bottle', 'Travel insurance documents'],
      bestTimeToVisit: 'July–October for dry season and Great Migration',
      weatherNotes: 'Expect warm days (25–30°C) and cool nights (10–15°C). Pack layers.',
      visaInfo: 'Kenya: eVisa available online ($51). Tanzania: Visa on arrival ($50) or eVisa.',
      healthTips: ['Get yellow fever vaccination before travel', 'Take malaria prophylaxis as recommended', 'Drink bottled or filtered water only', 'Apply sunscreen and insect repellent daily'],
    }
  }
}
