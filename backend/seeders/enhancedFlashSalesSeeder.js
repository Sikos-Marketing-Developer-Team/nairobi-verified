const FlashSale = require('../models/FlashSale');
const User = require('../models/User');

const enhancedFlashSales = [
  {
    title: "Weekend Electronics Mega Sale",
    description: "Unbeatable deals on laptops, phones, cameras, and gadgets. Limited time only!",
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
        stockQuantity: 25,
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
        stockQuantity: 30,
        soldQuantity: 18,
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
        stockQuantity: 15,
        soldQuantity: 8,
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
        stockQuantity: 40,
        soldQuantity: 25,
        maxQuantityPerUser: 2
      },
      {
        productId: "flash_product_5",
        name: "Gaming Mechanical Keyboard",
        originalPrice: 9000,
        salePrice: 6500,
        discountPercentage: 28,
        image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop",
        merchant: "Gaming Hub Kenya",
        merchantId: "60d0fe4f5311236168a10108",
        stockQuantity: 35,
        soldQuantity: 20,
        maxQuantityPerUser: 3
      },
      {
        productId: "flash_product_6",
        name: "Smart Fitness Watch",
        originalPrice: 12000,
        salePrice: 8500,
        discountPercentage: 29,
        image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop",
        merchant: "FitTech Kenya",
        merchantId: "60d0fe4f5311236168a10109",
        stockQuantity: 40,
        soldQuantity: 28,
        maxQuantityPerUser: 2
      }
    ],
    totalViews: 2847,
    totalSales: 91
  },
  {
    title: "Fashion Friday Flash Sale",
    description: "Trendy clothes, accessories, and watches at incredible prices. Don't miss out!",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // Starts in 24 hours
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 72), // Ends in 72 hours
    isActive: true,
    products: [
      {
        productId: "flash_product_7",
        name: "Designer Leather Handbag",
        originalPrice: 15000,
        salePrice: 8500,
        discountPercentage: 43,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=300&fit=crop",
        merchant: "Fashion House CBD",
        merchantId: "60d0fe4f5311236168a10106",
        stockQuantity: 20,
        soldQuantity: 12,
        maxQuantityPerUser: 2
      },
      {
        productId: "flash_product_8",
        name: "Nike Air Max 270",
        originalPrice: 18000,
        salePrice: 12000,
        discountPercentage: 33,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
        merchant: "Sports Corner",
        merchantId: "60d0fe4f5311236168a10103",
        stockQuantity: 50,
        soldQuantity: 35,
        maxQuantityPerUser: 3
      },
      {
        productId: "flash_product_9",
        name: "Premium Watch Collection",
        originalPrice: 25000,
        salePrice: 16000,
        discountPercentage: 36,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
        merchant: "Time Pieces Kenya",
        merchantId: "60d0fe4f5311236168a10107",
        stockQuantity: 15,
        soldQuantity: 8,
        maxQuantityPerUser: 1
      },
      {
        productId: "flash_product_10",
        name: "Professional Hair Dryer",
        originalPrice: 5500,
        salePrice: 3500,
        discountPercentage: 36,
        image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=300&fit=crop",
        merchant: "Beauty Pro Kenya",
        merchantId: "60d0fe4f5311236168a10110",
        stockQuantity: 30,
        soldQuantity: 18,
        maxQuantityPerUser: 2
      }
    ],
    totalViews: 1592,
    totalSales: 73
  },
  {
    title: "Home & Office Essentials Sale",
    description: "Transform your workspace and home with these amazing deals on furniture and accessories.",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 48), // Starts in 48 hours
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 96), // Ends in 96 hours
    isActive: true,
    products: [
      {
        productId: "flash_product_11",
        name: "Ergonomic Office Chair",
        originalPrice: 22000,
        salePrice: 15000,
        discountPercentage: 32,
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
        merchant: "Office Solutions",
        merchantId: "60d0fe4f5311236168a10106",
        stockQuantity: 25,
        soldQuantity: 15,
        maxQuantityPerUser: 2
      },
      {
        productId: "flash_product_12",
        name: "Wireless Bluetooth Speaker",
        originalPrice: 7000,
        salePrice: 4500,
        discountPercentage: 36,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop",
        merchant: "Audio Excellence",
        merchantId: "60d0fe4f5311236168a10105",
        stockQuantity: 60,
        soldQuantity: 45,
        maxQuantityPerUser: 3
      }
    ],
    totalViews: 892,
    totalSales: 60
  }
];

const seedEnhancedFlashSales = async () => {
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
    const flashSalesWithCreator = enhancedFlashSales.map(sale => ({
      ...sale,
      createdBy: adminUser._id
    }));

    // Insert enhanced flash sales
    const createdFlashSales = await FlashSale.insertMany(flashSalesWithCreator);
    
    console.log(`✅ Successfully seeded ${createdFlashSales.length} enhanced flash sales`);
    console.log('Flash Sales:');
    createdFlashSales.forEach(sale => {
      console.log(`- ${sale.title} (${sale.products.length} products)`);
    });

    return createdFlashSales;

  } catch (error) {
    console.error('❌ Error seeding enhanced flash sales:', error);
    throw error;
  }
};

module.exports = { seedEnhancedFlashSales, enhancedFlashSales };