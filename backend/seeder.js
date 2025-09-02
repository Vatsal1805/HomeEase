const mongoose = require('mongoose');
const Service = require('./models/Service');
require('dotenv').config();

// Sample services data
const services = [
  // Plumbing Services
  {
    name: 'Tap Fix',
    description: 'Professional tap repair and maintenance service. Fix leaky taps, replace washers, and ensure proper water flow.',
    category: 'plumbing',
    price: 149,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    tags: ['tap', 'repair', 'faucet', 'leak'],
    isActive: true
  },
  {
    name: 'Pipe Repair',
    description: 'Complete pipe repair service including leak detection, pipe replacement, and water pressure restoration.',
    category: 'plumbing',
    price: 299,
    duration: 120,
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400',
    tags: ['pipe', 'leak', 'repair', 'water'],
    isActive: true
  },
  {
    name: 'Toilet Repair',
    description: 'Fix toilet flush problems, seat replacement, and complete toilet maintenance service.',
    category: 'plumbing',
    price: 199,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=400',
    tags: ['toilet', 'flush', 'repair', 'bathroom'],
    isActive: true
  },

  // Electrical Services
  {
    name: 'Switch Repair',
    description: 'Electrical switch and socket repair service. Fix faulty switches, install new ones, and ensure electrical safety.',
    category: 'electrical',
    price: 99,
    duration: 45,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
    tags: ['switch', 'socket', 'electrical', 'repair'],
    isActive: true
  },
  {
    name: 'Fan Installation',
    description: 'Professional ceiling and wall fan installation service with proper wiring and mounting.',
    category: 'electrical',
    price: 249,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    tags: ['fan', 'installation', 'ceiling', 'electrical'],
    isActive: true
  },
  {
    name: 'Wiring Check',
    description: 'Complete electrical wiring inspection and safety check for your home or office.',
    category: 'electrical',
    price: 399,
    duration: 120,
    image: 'https://images.unsplash.com/photo-1621905252472-e8ace008e9e7?w=400',
    tags: ['wiring', 'inspection', 'electrical', 'safety'],
    isActive: true
  },

  // Cleaning Services
  {
    name: 'House Cleaning',
    description: 'Complete home deep cleaning service including all rooms, kitchen, and bathrooms.',
    category: 'cleaning',
    price: 599,
    duration: 180,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    tags: ['house', 'cleaning', 'deep clean', 'home'],
    isActive: true
  },
  {
    name: 'Bathroom Cleaning',
    description: 'Specialized bathroom deep cleaning and sanitization service.',
    category: 'cleaning',
    price: 299,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
    tags: ['bathroom', 'cleaning', 'sanitization', 'deep clean'],
    isActive: true
  },
  {
    name: 'Kitchen Cleaning',
    description: 'Professional kitchen deep cleaning including appliances, cabinets, and surfaces.',
    category: 'cleaning',
    price: 399,
    duration: 120,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    tags: ['kitchen', 'cleaning', 'appliances', 'deep clean'],
    isActive: true
  },

  // Carpentry Services
  {
    name: 'Furniture Repair',
    description: 'Professional furniture repair and restoration service for all types of wooden furniture.',
    category: 'carpentry',
    price: 349,
    duration: 120,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    tags: ['furniture', 'repair', 'wood', 'restoration'],
    isActive: true
  },
  {
    name: 'Door Installation',
    description: 'Complete door installation service including frame adjustment and hardware installation.',
    category: 'carpentry',
    price: 499,
    duration: 150,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    tags: ['door', 'installation', 'carpentry', 'hardware'],
    isActive: true
  },

  // AC Service
  {
    name: 'AC Repair',
    description: 'Air conditioning repair service including cooling issues, filter replacement, and maintenance.',
    category: 'ac-service',
    price: 449,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1631545806526-c4c79bb9bc86?w=400',
    tags: ['ac', 'repair', 'cooling', 'maintenance'],
    isActive: true
  },
  {
    name: 'AC Installation',
    description: 'Professional air conditioning installation service with proper mounting and electrical connections.',
    category: 'ac-service',
    price: 799,
    duration: 180,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    tags: ['ac', 'installation', 'cooling', 'electrical'],
    isActive: true
  },

  // Painting Services
  {
    name: 'Wall Painting',
    description: 'Professional interior and exterior wall painting service with quality paints and finishes.',
    category: 'painting',
    price: 899,
    duration: 240,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
    tags: ['painting', 'wall', 'interior', 'exterior'],
    isActive: true
  },
  {
    name: 'Touch-up Painting',
    description: 'Quick touch-up painting service for small areas and minor wall repairs.',
    category: 'painting',
    price: 299,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    tags: ['touch-up', 'painting', 'repair', 'small'],
    isActive: true
  }
];

async function seedServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/homeease', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing services
    await Service.deleteMany({});
    console.log('🗑️  Cleared existing services');

    // Insert new services
    const createdServices = await Service.insertMany(services);
    console.log(`✅ Created ${createdServices.length} services`);

    console.log('🎉 Database seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
seedServices();
