const FlashSale = require('../models/FlashSale');
const User = require('../models/User');

const sampleFlashSales = [
  {
    title: "Weekend Electronics Mega Sale",
    description: "Unbeatable deals on laptops, phones, and gadgets. Limited time only!",
    startDate: new Date(Date.now() + 1000 * 60 * 60), // Starts in 1 hour
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 48), // Ends in 48 hours
    isActive: true,
    products: [
      {
        productId: "flash_product_1",
        name: "MacBook Pro 16-inch M3",
        originalPrice: 250000,
        salePrice: 185000,
        discountPercentage: 26,
        image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop",
        merchant: "TechHub Kenya",
        merchantId: "60d0fe4f5311236168a10101",
        stockQuantity: 20,
        soldQuantity: 12,
        maxQuantityPerUser: 2
      },
      {
        productId: "flash_product_2",
        name: "Samsung Galaxy S24 Ultra",
        originalPrice: 150000,
        salePrice: 120000,
        discountPercentage: 20,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
        merchant: "Mobile World CBD",
        merchantId: "60d0fe4f5311236168a10102",
        stockQuantity: 15,
        soldQuantity: 8,
        maxQuantityPerUser: 1
      },
      {
        productId: "flash_product_3",
        name: "Canon EOS R5 Camera",
        originalPrice: 95000,
        salePrice: 75000,
        discountPercentage: 21,
        image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop",
        merchant: "PhotoPro Kenya",
        merchantId: "60d0fe4f5311236168a10104",
        stockQuantity: 8,
        soldQuantity: 3,
        maxQuantityPerUser: 1
      },
      {
        productId: "flash_product_4",
        name: "Sony WH-1000XM5 Headphones",
        originalPrice: 45000,
        salePrice: 32000,
        discountPercentage: 29,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
        merchant: "Audio Excellence",
        merchantId: "60d0fe4f5311236168a10105",
        stockQuantity: 25,
        soldQuantity: 18,
        maxQuantityPerUser: 2
      }
    ],
    totalViews: 1247,
    totalSales: 41
  },
  {
    title: "Fashion Friday Flash Sale",
    description: "Trendy clothes and accessories at incredible prices. Don't miss out!",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // Starts in 24 hours
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 72), // Ends in 72 hours
    isActive: true,
    products: [
      {
        productId: "flash_product_5",
        name: "Designer Leather Handbag",
        originalPrice: 15000,
        salePrice: 8500,
        discountPercentage: 43,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=300&fit=crop",
        merchant: "Fashion House CBD",
        merchantId: "60d0fe4f5311236168a10106",
        stockQuantity: 12,
        soldQuantity: 5,
        maxQuantityPerUser: 2
      },
      {
        productId: "flash_product_6",
        name: "Nike Air Max 270",
        originalPrice: 18000,
        salePrice: 12000,
        discountPercentage: 33,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
        merchant: "Sports Corner",
        merchantId: "60d0fe4f5311236168a10103",
        stockQuantity: 30,
        soldQuantity: 22,
        maxQuantityPerUser: 3
      },
      {
        productId: "flash_product_7",
        name: "Premium Watch Collection",
        originalPrice: 25000,
        salePrice: 16000,
        discountPercentage: 36,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
        merchant: "Time Pieces Kenya",
        merchantId: "60d0fe4f5311236168a10107",
        stockQuantity: 10,
        soldQuantity: 4,
        maxQuantityPerUser: 1
      }
    ],
    totalViews: 892,
    totalSales: 31
  }
];

const seedFlashSales = async () => {
  try {
    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }

    // Clear existing flash sales
    await FlashSale.deleteMany({});
    console.log('Cleared existing flash sales');

    // Add creator to each flash sale
    const flashSalesWithCreator = sampleFlashSales.map(sale => ({
      ...sale,
      createdBy: adminUser._id
    }));

    // Insert sample flash sales
    const createdFlashSales = await FlashSale.insertMany(flashSalesWithCreator);
    
    console.log(`✅ Successfully seeded ${createdFlashSales.length} flash sales`);
    console.log('Flash Sales:');
    createdFlashSales.forEach(sale => {
      console.log(`- ${sale.title} (${sale.products.length} products)`);
    });

  } catch (error) {
    console.error('❌ Error seeding flash sales:', error);
  }
};

module.exports = { seedFlashSales, sampleFlashSales };