import * as mongoose from 'mongoose'
import * as bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tembea-africa'

async function seed() {
  console.log('🌱 Connecting to MongoDB...')
  // Connect and ensure the underlying driver `db` is available
  const conn = await mongoose.connect(MONGODB_URI)
  console.log('✅ Connected (mongoose)')

  // In some environments `connection.db` may not be populated immediately
  if (!conn.connection.db) {
    // wait for the native driver to emit 'open'
    await new Promise<void>((resolve) => conn.connection.once('open', () => resolve()))
  }
  const db = conn.connection.db

  // Clear existing data
  await Promise.all([
    db.collection('users').deleteMany({}),
    db.collection('destinations').deleteMany({}),
    db.collection('tours').deleteMany({}),
    db.collection('accommodations').deleteMany({}),
    db.collection('guides').deleteMany({}),
    db.collection('reviews').deleteMany({}),
  ])
  console.log('🧹 Cleared existing data')

  // ─── USERS ─────────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Admin@123', 12)
  const users = await db.collection('users').insertMany([
    { firstName: 'Admin', lastName: 'Tembea', email: 'admin@tembeaafrica.com', password: hashedPassword, role: 'admin', isVerified: true, createdAt: new Date() },
    { firstName: 'Joseph', lastName: 'Kamau', email: 'joseph@tembeaafrica.com', password: hashedPassword, role: 'guide', isVerified: true, createdAt: new Date() },
    { firstName: 'Amina', lastName: 'Mohamed', email: 'amina@tembeaafrica.com', password: hashedPassword, role: 'guide', isVerified: true, createdAt: new Date() },
    { firstName: 'John', lastName: 'Traveller', email: 'john@example.com', password: hashedPassword, role: 'tourist', isVerified: true, createdAt: new Date() },
    { firstName: 'Sarah', lastName: 'Williams', email: 'sarah@example.com', password: hashedPassword, role: 'tourist', isVerified: true, nationality: 'United Kingdom', createdAt: new Date() },
    { firstName: 'Mara', lastName: 'Safaris', email: 'operator@marasafaris.com', password: hashedPassword, role: 'operator', isVerified: true, createdAt: new Date() },
  ])

  const adminId = users.insertedIds[0]
  const guideJosephId = users.insertedIds[1]
  const guideAminaId = users.insertedIds[2]
  const touristId = users.insertedIds[3]
  const operatorId = users.insertedIds[5]
  console.log('✅ Users seeded')

  // ─── DESTINATIONS ──────────────────────────────────────────────────────────
  const destinations = await db.collection('destinations').insertMany([
    { name: 'Maasai Mara', slug: 'maasai-mara', country: 'kenya', county: 'Narok', description: 'Home to the Great Wildebeest Migration and Africa\'s finest Big Five wildlife viewing.', heroImage: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1200', images: ['https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800'], coordinates: { lat: -1.5001, lng: 35.1399 }, rating: 4.9, reviewCount: 1240, tourCount: 86, hotelCount: 45, tags: ['Wildlife', 'Safari', 'Migration', 'Big Five'], bestTimeToVisit: 'July–October', featured: true, status: 'active', travelTips: 'Book sunrise game drives for best predator sightings.', visaInfo: 'Kenya eVisa available online at $51.', createdAt: new Date() },
    { name: 'Zanzibar', slug: 'zanzibar', country: 'tanzania', description: 'Pristine white sandy beaches, turquoise Indian Ocean waters, and rich Swahili cultural heritage.', heroImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200', images: [], coordinates: { lat: -6.1659, lng: 39.2026 }, rating: 4.8, reviewCount: 890, tourCount: 54, hotelCount: 120, tags: ['Beach', 'Culture', 'Diving', 'Spice'], bestTimeToVisit: 'June–October', featured: true, status: 'active', createdAt: new Date() },
    { name: 'Kilimanjaro', slug: 'kilimanjaro', country: 'tanzania', description: 'Africa\'s highest peak at 5,895m. The ultimate trekking challenge attracting climbers from across the globe.', heroImage: 'https://images.unsplash.com/photo-1621414050345-53db43f7e7ab?w=1200', images: [], coordinates: { lat: -3.0674, lng: 37.3556 }, rating: 4.9, reviewCount: 620, tourCount: 32, hotelCount: 28, tags: ['Trekking', 'Adventure', 'Mountain', 'Summit'], bestTimeToVisit: 'January–March, June–October', featured: true, status: 'active', createdAt: new Date() },
    { name: 'Serengeti', slug: 'serengeti', country: 'tanzania', description: 'Endless golden plains hosting the world\'s greatest wildlife spectacle — year-round Big Five and the Great Migration.', heroImage: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=1200', images: [], coordinates: { lat: -2.3333, lng: 34.8333 }, rating: 5.0, reviewCount: 1100, tourCount: 98, hotelCount: 62, tags: ['Wildlife', 'Safari', 'Photography', 'Migration'], bestTimeToVisit: 'June–September', featured: true, status: 'active', createdAt: new Date() },
    { name: 'Mombasa', slug: 'mombasa', country: 'kenya', description: 'Kenya\'s vibrant coastal city blending Old Town Swahili heritage with beautiful Indian Ocean beaches.', heroImage: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200', images: [], coordinates: { lat: -4.0435, lng: 39.6682 }, rating: 4.7, reviewCount: 980, tourCount: 71, hotelCount: 134, tags: ['Beach', 'History', 'Culture', 'City'], bestTimeToVisit: 'October–April', featured: true, status: 'active', createdAt: new Date() },
    { name: 'Diani Beach', slug: 'diani-beach', country: 'kenya', description: 'Kenya\'s most celebrated beach — 17km of powder-white sand, coral reefs, and world-class resorts.', heroImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200', images: [], coordinates: { lat: -4.2947, lng: 39.5748 }, rating: 4.8, reviewCount: 560, tourCount: 38, hotelCount: 67, tags: ['Beach', 'Snorkeling', 'Relaxation', 'Diving'], bestTimeToVisit: 'December–April', featured: true, status: 'active', createdAt: new Date() },
    { name: 'Ngorongoro', slug: 'ngorongoro', country: 'tanzania', description: 'The world\'s largest intact volcanic caldera — a UNESCO World Heritage Site with extraordinary wildlife density.', heroImage: 'https://images.unsplash.com/photo-1540202403-b7abd6747a18?w=1200', images: [], coordinates: { lat: -3.2026, lng: 35.4866 }, rating: 4.9, reviewCount: 742, tourCount: 45, hotelCount: 22, tags: ['Wildlife', 'Crater', 'UNESCO', 'Big Five'], bestTimeToVisit: 'June–October', featured: false, status: 'active', createdAt: new Date() },
    { name: 'Amboseli', slug: 'amboseli', country: 'kenya', description: 'Watch elephant herds roam beneath the snow-capped peak of Kilimanjaro in this iconic Kenyan park.', heroImage: 'https://images.unsplash.com/photo-1551649001-7a2482d98d05?w=1200', images: [], coordinates: { lat: -2.6527, lng: 37.2606 }, rating: 4.8, reviewCount: 410, tourCount: 34, hotelCount: 18, tags: ['Wildlife', 'Elephants', 'Photography', 'Kilimanjaro views'], bestTimeToVisit: 'June–October, January–February', featured: false, status: 'active', createdAt: new Date() },
  ])
  const maraId = destinations.insertedIds[0]
  const zanzibarId = destinations.insertedIds[1]
  const kiliId = destinations.insertedIds[2]
  const serengetiId = destinations.insertedIds[3]
  console.log('✅ Destinations seeded')

  // ─── TOURS ─────────────────────────────────────────────────────────────────
  const tours = await db.collection('tours').insertMany([
    {
      title: '5-Day Maasai Mara Safari — Big Five Guaranteed',
      slug: 'maasai-mara-big-five-5day-' + Date.now(),
      description: 'Immerse yourself in the heart of the Maasai Mara on this 5-day safari. Witness lions, leopards, elephants, buffalos, and rhinos up close.',
      destination: maraId,
      operator: operatorId,
      category: 'safari',
      images: ['https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800'],
      price: 480, currency: 'USD', duration: '5 days', groupSize: 8,
      rating: 4.9, reviewCount: 312, featured: true, instantBooking: true, status: 'active',
      includes: ['4WD safari vehicle', 'Professional guide', 'Park fees', 'Accommodation', 'All meals', 'Airport pickup'],
      excludes: ['International flights', 'Travel insurance', 'Tips', 'Personal items'],
      itinerary: [
        { day: 1, title: 'Arrive Nairobi — Transfer to Mara', description: 'Depart from Nairobi and transfer to Maasai Mara', activities: ['Airport pickup', 'Scenic drive through Rift Valley', 'Arrive at camp', 'Evening game drive'], meals: ['Dinner'], accommodation: 'Mara Camp' },
        { day: 2, title: 'Full Day Game Drives', description: 'Morning and afternoon game drives', activities: ['Sunrise game drive', 'Bush breakfast', 'Afternoon drive', 'Sundowners'], meals: ['Breakfast', 'Lunch', 'Dinner'], accommodation: 'Mara Camp' },
      ],
      tags: ['Safari', 'Big Five', 'Luxury', 'Kenya'],
      totalBookings: 156, isDeleted: false, createdAt: new Date(),
    },
    {
      title: 'Zanzibar Island Dhow Cruise & Spice Tour',
      slug: 'zanzibar-dhow-cruise-spice-' + Date.now(),
      description: 'Sail on a traditional wooden dhow along Zanzibar\'s turquoise coast, then explore fragrant spice plantations.',
      destination: zanzibarId,
      operator: operatorId,
      category: 'beach',
      images: ['https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800'],
      price: 75, currency: 'USD', duration: '1 day', groupSize: 12,
      rating: 4.8, reviewCount: 197, featured: true, instantBooking: true, status: 'active',
      includes: ['Dhow boat', 'Snorkeling equipment', 'Lunch on boat', 'Spice farm entry', 'Guide'],
      excludes: ['Hotel pickup', 'Alcoholic drinks'],
      itinerary: [],
      tags: ['Beach', 'Dhow', 'Spices', 'Snorkeling'],
      totalBookings: 89, isDeleted: false, createdAt: new Date(),
    },
    {
      title: 'Kilimanjaro Summit Trek — 7 Days Machame Route',
      slug: 'kilimanjaro-machame-7day-' + Date.now(),
      description: 'Conquer Africa\'s highest peak via the scenic Machame "Whiskey" route with our KWS-certified mountain guides.',
      destination: kiliId,
      operator: operatorId,
      category: 'mountain',
      images: ['https://images.unsplash.com/photo-1621414050345-53db43f7e7ab?w=800'],
      price: 1850, currency: 'USD', duration: '7 days', groupSize: 6,
      rating: 4.9, reviewCount: 88, featured: true, instantBooking: false, status: 'active',
      includes: ['KWS-certified guide', 'Porters', 'All meals on mountain', 'Camping equipment', 'Park fees', 'Transfers'],
      excludes: ['International flights', 'Sleeping bag', 'Tips', 'Travel insurance'],
      itinerary: [],
      tags: ['Trekking', 'Summit', 'Adventure', 'Mountain'],
      totalBookings: 42, isDeleted: false, createdAt: new Date(),
    },
    {
      title: 'Serengeti Great Migration Safari — Private Vehicle',
      slug: 'serengeti-migration-private-' + Date.now(),
      description: 'Chase the wildebeest migration across the endless Serengeti plains in a private 4WD Land Cruiser.',
      destination: serengetiId,
      operator: operatorId,
      category: 'safari',
      images: ['https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=800'],
      price: 960, currency: 'USD', duration: '4 days', groupSize: 4,
      rating: 5.0, reviewCount: 143, featured: true, instantBooking: true, status: 'active',
      includes: ['Private Land Cruiser', 'Expert guide', 'Park fees', 'Luxury camp', 'All meals', 'Airstrip transfers'],
      excludes: ['Flights to Arusha', 'Tips', 'Alcoholic beverages'],
      itinerary: [],
      tags: ['Safari', 'Migration', 'Private', 'Luxury'],
      totalBookings: 78, isDeleted: false, createdAt: new Date(),
    },
  ])
  const tourMaraId = tours.insertedIds[0]
  console.log('✅ Tours seeded')

  // ─── GUIDES ────────────────────────────────────────────────────────────────
  await db.collection('guides').insertMany([
    { user: guideJosephId, bio: 'KWS-certified safari guide with 12 years experience in Maasai Mara. Specialist in big cat behaviour and bird watching. Fluent in English, Swahili, and French.', languages: ['English', 'Swahili', 'French'], certifications: ['KWS Level 3', 'Wilderness First Aid', 'Bird Guide Certificate'], specializations: ['Big Five tracking', 'Bird watching', 'Photography safaris'], experience: 12, hourlyRate: 15, dailyRate: 80, rating: 5.0, reviewCount: 128, category: 'safari', verified: true, status: 'active', isDeleted: false, createdAt: new Date() },
    { user: guideAminaId, bio: 'Cultural and city guide with 8 years exploring Zanzibar\'s history, spice farms, and Stone Town. Passionate about Swahili heritage and coastal cuisine.', languages: ['English', 'Swahili', 'Arabic'], certifications: ['Tanzania Tourism Board Certified', 'Cultural Heritage Guide'], specializations: ['Stone Town history', 'Spice tours', 'Swahili culture', 'Street food'], experience: 8, hourlyRate: 12, dailyRate: 60, rating: 4.9, reviewCount: 95, category: 'cultural', verified: true, status: 'active', isDeleted: false, createdAt: new Date() },
  ])
  console.log('✅ Guides seeded')

  // ─── ACCOMMODATIONS ────────────────────────────────────────────────────────
  await db.collection('accommodations').insertMany([
    { name: 'Mara Serena Safari Lodge', slug: 'mara-serena-safari-lodge-' + Date.now(), type: 'lodge', destination: maraId, owner: operatorId, description: 'Perched on a hill in the heart of the Maasai Mara, Mara Serena offers stunning panoramic views over the plains.', images: ['https://images.unsplash.com/photo-1540541338537-71001bab8c76?w=800'], pricePerNight: 320, currency: 'USD', rating: 4.9, reviewCount: 420, amenities: ['Swimming pool', 'Spa', 'WiFi', 'Restaurant', 'Bar', 'Game room', 'Laundry', 'Room service'], rooms: [{ name: 'Savanna Room', description: 'Luxury room with savanna views', pricePerNight: 320, maxGuests: 2, images: [], amenities: ['AC', 'En-suite', 'Mini bar', 'Private deck'] }], coordinates: { lat: -1.502, lng: 35.145 }, featured: true, status: 'active', isDeleted: false, createdAt: new Date() },
    { name: 'Zanzibar Reef Beach Resort', slug: 'zanzibar-reef-beach-resort-' + Date.now(), type: 'resort', destination: zanzibarId, owner: operatorId, description: 'Beachfront resort in Nungwi with direct access to Zanzibar\'s most stunning coral reef.', images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'], pricePerNight: 180, currency: 'USD', rating: 4.8, reviewCount: 310, amenities: ['Beachfront', 'Pool', 'Spa', 'Snorkeling', 'Restaurant', 'WiFi', 'Water sports'], rooms: [], coordinates: { lat: -5.723, lng: 39.302 }, featured: true, status: 'active', isDeleted: false, createdAt: new Date() },
  ])
  console.log('✅ Accommodations seeded')

  // ─── REVIEWS ───────────────────────────────────────────────────────────────
  await db.collection('reviews').insertMany([
    { user: touristId, targetType: 'tour', targetId: tourMaraId.toString(), rating: 5, title: 'Absolutely life-changing experience!', body: 'Our guide spotted a leopard on the first morning and we witnessed a lion kill on day 3. Joseph was phenomenal — knowledgeable, passionate, and incredibly skilled. Tembea Africa made the whole trip effortless from booking to departure.', verified: true, approved: true, isDeleted: false, createdAt: new Date() },
    { user: users.insertedIds[4], targetType: 'tour', targetId: tourMaraId.toString(), rating: 5, title: 'Best safari in Africa — period', body: 'Saw all Big Five within the first two days. The balloon safari on day 3 was the most magical experience of my life. The camp was incredible and the food was outstanding. Will definitely be back!', verified: true, approved: true, isDeleted: false, createdAt: new Date() },
  ])
  console.log('✅ Reviews seeded')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📋 Login credentials:')
  console.log('   Admin:    admin@tembeaafrica.com / Admin@123')
  console.log('   Guide:    joseph@tembeaafrica.com / Admin@123')
  console.log('   Tourist:  john@example.com / Admin@123')
  console.log('   Operator: operator@marasafaris.com / Admin@123')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
