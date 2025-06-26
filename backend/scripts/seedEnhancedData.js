const mongoose = require('mongoose');
const User = require('../models/User');
const Merchant = require('../models/Merchant');
const FlashSale = require('../models/FlashSale');
const Product = require('../models/Product');
const { seedEnhancedFlashSales } = require('../seeders/enhancedFlashSalesSeeder');
const enhancedProducts = require('../_data/enhanced-products.json');

// Enhanced merchants data
const enhancedMerchants = [
  {
    businessName: "TechHub Kenya",
    email: "info@techhubkenya.com",
    phone: "+254712345001",
    address: "Kimathi Street, CBD, Nairobi",
    category: "Electronics",
    description: "Leading electronics retailer specializing in laptops, computers, and tech accessories.",
    website: "https://techhubkenya.com",
    socialMedia: {
      facebook: "https://facebook.com/techhubkenya",
      instagram: "https://instagram.com/techhubkenya"
    },
    businessHours: {
      monday: "8:00 AM - 6:00 PM",
      tuesday: "8:00 AM - 6:00 PM",
      wednesday: "8:00 AM - 6:00 PM",
      thursday: "8:00 AM - 6:00 PM",
      friday: "8:00 AM - 6:00 PM",
      saturday: "9:00 AM - 5:00 PM",
      sunday: "Closed"
    },
    coordinates: { lat: -1.2864, lng: 36.8172 },
    verified: true,
    featured: true,
    rating: 4.8,
    reviewCount: 156
  },
  {
    businessName: "Mobile World CBD",
    email: "sales@mobileworldcbd.com",
    phone: "+254712345002",
    address: "Tom Mboya Street, CBD, Nairobi",
    category: "Electronics",
    description: "Your one-stop shop for smartphones, tablets, and mobile accessories.",
    website: "https://mobileworldcbd.com",
    socialMedia: {
      facebook: "https://facebook.com/mobileworldcbd",
      twitter: "https://twitter.com/mobileworldcbd"
    },
    businessHours: {
      monday: "8:30 AM - 7:00 PM",
      tuesday: "8:30 AM - 7:00 PM",
      wednesday: "8:30 AM - 7:00 PM",
      thursday: "8:30 AM - 7:00 PM",
      friday: "8:30 AM - 7:00 PM",
      saturday: "9:00 AM - 6:00 PM",
      sunday: "10:00 AM - 4:00 PM"
    },
    coordinates: { lat: -1.2873, lng: 36.8247 },
    verified: true,
    featured: true,
    rating: 4.6,
    reviewCount: 203
  },
  {
    businessName: "Fashion House CBD",
    email: "hello@fashionhousecbd.com",
    phone: "+254712345003",
    address: "River Road, CBD, Nairobi",
    category: "Fashion",
    description: "Premium fashion boutique offering designer clothing, bags, and accessories.",
    website: "https://fashionhousecbd.com",
    socialMedia: {
      instagram: "https://instagram.com/fashionhousecbd",
      facebook: "https://facebook.com/fashionhousecbd"
    },
    businessHours: {
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 6:00 PM",
      friday: "9:00 AM - 6:00 PM",
      saturday: "9:00 AM - 7:00 PM",
      sunday: "11:00 AM - 5:00 PM"
    },
    coordinates: { lat: -1.2833, lng: 36.8342 },
    verified: true,
    featured: true,
    rating: 4.4,
    reviewCount: 89
  },
  {
    businessName: "PhotoPro Kenya",
    email: "info@photoprokenya.com",
    phone: "+254712345004",
    address: "Koinange Street, CBD, Nairobi",
    category: "Electronics",
    description: "Professional photography equipment and camera specialists.",
    website: "https://photoprokenya.com",
    businessHours: {
      monday: "8:00 AM - 6:00 PM",
      tuesday: "8:00 AM - 6:00 PM",
      wednesday: "8:00 AM - 6:00 PM",
      thursday: "8:00 AM - 6:00 PM",
      friday: "8:00 AM - 6:00 PM",
      saturday: "9:00 AM - 5:00 PM",
      sunday: "Closed"
    },
    coordinates: { lat: -1.2881, lng: 36.8233 },
    verified: true,
    featured: false,
    rating: 4.9,
    reviewCount: 67
  },
  {
    businessName: "Audio Excellence",
    email: "sales@audioexcellence.co.ke",
    phone: "+254712345005",
    address: "Moi Avenue, CBD, Nairobi",
    category: "Electronics",
    description: "High-quality audio equipment, headphones, and sound systems.",
    businessHours: {
      monday: "8:30 AM - 6:30 PM",
      tuesday: "8:30 AM - 6:30 PM",
      wednesday: "8:30 AM - 6:30 PM",
      thursday: "8:30 AM - 6:30 PM",
      friday: "8:30 AM - 6:30 PM",
      saturday: "9:00 AM - 6:00 PM",
      sunday: "10:00 AM - 4:00 PM"
    },
    coordinates: { lat: -1.2921, lng: 36.8219 },
    verified: true,
    featured: false,
    rating: 4.5,
    reviewCount: 134
  },
  {
    businessName: "Sports Corner",
    email: "info@sportscorner.co.ke",
    phone: "+254712345006",
    address: "Moi Avenue, CBD, Nairobi",
    category: "Sports",
    description: "Premium sports equipment, shoes, and athletic wear.",
    businessHours: {
      monday: "8:00 AM - 7:00 PM",
      tuesday: "8:00 AM - 7:00 PM",
      wednesday: "8:00 AM - 7:00 PM",
      thursday: "8:00 AM - 7:00 PM",
      friday: "8:00 AM - 7:00 PM",
      saturday: "8:00 AM - 8:00 PM",
      sunday: "10:00 AM - 6:00 PM"
    },
    coordinates: { lat: -1.2925, lng: 36.8215 },
    verified: true,
    featured: false,
    rating: 4.3,
    reviewCount: 178
  },
  {
    businessName: "Time Pieces Kenya",
    email: "sales@timepieceskenya.com",
    phone: "+254712345007",
    address: "Kenyatta Avenue, CBD, Nairobi",
    category: "Fashion",
    description: "Luxury watches and timepieces from premium brands.",
    website: "https://timepieceskenya.com",
    businessHours: {
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 6:00 PM",
      friday: "9:00 AM - 6:00 PM",
      saturday: "9:00 AM - 5:00 PM",
      sunday: "Closed"
    },
    coordinates: { lat: -1.2876, lng: 36.8254 },
    verified: true,
    featured: false,
    rating: 4.7,
    reviewCount: 45
  },
  {
    businessName: "Gaming Hub Kenya",
    email: "hello@gaminghubkenya.com",
    phone: "+254712345008",
    address: "Sarit Centre, Westlands, Nairobi",
    category: "Electronics",
    description: "Gaming equipment, accessories, and computer peripherals.",
    website: "https://gaminghubkenya.com",
    socialMedia: {
      instagram: "https://instagram.com/gaminghubkenya",
      twitter: "https://twitter.com/gaminghubke"
    },
    businessHours: {
      monday: "10:00 AM - 8:00 PM",
      tuesday: "10:00 AM - 8:00 PM",
      wednesday: "10:00 AM - 8:00 PM",
      thursday: "10:00 AM - 8:00 PM",
      friday: "10:00 AM - 9:00 PM",
      saturday: "10:00 AM - 9:00 PM",
      sunday: "11:00 AM - 7:00 PM"
    },
    coordinates: { lat: -1.2676, lng: 36.8108 },
    verified: true,
    featured: false,
    rating: 4.4,
    reviewCount: 92
  },
  {
    businessName: "FitTech Kenya",
    email: "info@fittechkenya.com",
    phone: "+254712345009",
    address: "Westlands, Nairobi",
    category: "Electronics",
    description: "Fitness technology, smartwatches, and health monitoring devices.",
    businessHours: {
      monday: "8:00 AM - 7:00 PM",
      tuesday: "8:00 AM - 7:00 PM",
      wednesday: "8:00 AM - 7:00 PM",
      thursday: "8:00 AM - 7:00 PM",
      friday: "8:00 AM - 7:00 PM",
      saturday: "9:00 AM - 6:00 PM",
      sunday: "10:00 AM - 5:00 PM"
    },
    coordinates: { lat: -1.2630, lng: 36.8063 },
    verified: true,
    featured: false,
    rating: 4.5,
    reviewCount: 76
  },
  {
    businessName: "Beauty Pro Kenya",
    email: "contact@beautyprokenya.com",
    phone: "+254712345010",
    address: "Westgate Mall, Westlands, Nairobi",
    category: "Beauty",
    description: "Professional beauty equipment and cosmetic products.",
    businessHours: {
      monday: "10:00 AM - 8:00 PM",
      tuesday: "10:00 AM - 8:00 PM",
      wednesday: "10:00 AM - 8:00 PM",
      thursday: "10:00 AM - 8:00 PM",
      friday: "10:00 AM - 9:00 PM",
      saturday: "10:00 AM - 9:00 PM",
      sunday: "11:00 AM - 7:00 PM"
    },
    coordinates: { lat: -1.2659, lng: 36.8055 },
    verified: true,
    featured: false,
    rating: 4.2,
    reviewCount: 58
  },
  {
    businessName: "Office Solutions",
    email: "sales@officesolutions.co.ke",
    phone: "+254712345011",
    address: "Haile Selassie Avenue, CBD, Nairobi",
    category: "Home & Garden",
    description: "Office furniture, equipment, and workspace solutions.",
    businessHours: {
      monday: "8:00 AM - 6:00 PM",
      tuesday: "8:00 AM - 6:00 PM",
      wednesday: "8:00 AM - 6:00 PM",
      thursday: "8:00 AM - 6:00 PM",
      friday: "8:00 AM - 6:00 PM",
      saturday: "9:00 AM - 5:00 PM",
      sunday: "Closed"
    },
    coordinates: { lat: -1.2902, lng: 36.8211 },
    verified: true,
    featured: false,
    rating: 4.3,
    reviewCount: 112
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nairobi-verified');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedEnhancedData = async () => {
  try {
    await connectDB();

    console.log('🌱 Starting enhanced data seeding...');

    // 1. Ensure admin user exists
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@nairobi-verified.com',
        password: 'admin123', // This will be hashed by the pre-save middleware
        role: 'admin',
        isVerified: true
      });
      console.log('✅ Created admin user');
    }

    // 2. Clear existing data
    await Promise.all([
      Merchant.deleteMany({}),
      Product.deleteMany({}),
      FlashSale.deleteMany({})
    ]);
    console.log('🗑️ Cleared existing data');

    // 3. Seed merchants
    const createdMerchants = await Merchant.insertMany(
      enhancedMerchants.map(merchant => ({
        ...merchant,
        owner: adminUser._id,
        status: 'approved'
      }))
    );
    console.log(`✅ Seeded ${createdMerchants.length} merchants`);

    // Create merchant ID mapping
    const merchantMap = {};
    createdMerchants.forEach(merchant => {
      merchantMap[merchant.businessName] = merchant._id;
    });

    // 4. Seed products
    const productsWithMerchantIds = enhancedProducts.map(product => ({
      ...product,
      merchant: merchantMap[product.merchantName] || createdMerchants[0]._id,
      isActive: true
    }));

    const createdProducts = await Product.insertMany(productsWithMerchantIds);
    console.log(`✅ Seeded ${createdProducts.length} products`);

    // 5. Seed flash sales
    await seedEnhancedFlashSales();

    console.log('🎉 Enhanced data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Merchants: ${createdMerchants.length}`);
    console.log(`- Products: ${createdProducts.length}`);
    console.log(`- Featured Products: ${createdProducts.filter(p => p.featured).length}`);
    
    const flashSalesCount = await FlashSale.countDocuments();
    console.log(`- Flash Sales: ${flashSalesCount}`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding enhanced data:', error);
    process.exit(1);
  }
};

// Run the seeder if called directly
if (require.main === module) {
  seedEnhancedData();
}

module.exports = { seedEnhancedData };