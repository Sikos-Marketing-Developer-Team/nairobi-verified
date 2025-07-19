const mongoose = require('mongoose');
const Merchant = require('../models/Merchant');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/nairobi_verified', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const makeFeaturedMerchant = async () => {
  try {
    await connectDB();
    
    // Make TechHub Kenya a featured merchant
    const merchant = await Merchant.findOneAndUpdate(
      { businessName: 'TechHub Kenya' },
      { 
        featured: true,
        featuredDate: new Date()
      },
      { new: true }
    );
    
    if (merchant) {
      console.log('✅ TechHub Kenya has been made a featured merchant');
      console.log('Featured merchant details:', {
        businessName: merchant.businessName,
        email: merchant.email,
        featured: merchant.featured,
        featuredDate: merchant.featuredDate
      });
    } else {
      console.log('❌ TechHub Kenya merchant not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error making featured merchant:', error);
    process.exit(1);
  }
};

makeFeaturedMerchant();
