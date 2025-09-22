const { sequelize, connectDB } = require('../config/db');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Merchant = require('../models/Merchant');
const Product = require('../models/Product');
// const FlashSale = require('../models/FlashSale'); // TODO: Convert to Sequelize
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to PostgreSQL
    await connectDB();
    console.log('Connected to PostgreSQL');

    // Clear existing data
    await Promise.all([
      User.destroy({ where: {} }),
      Merchant.destroy({ where: {} }),
      Product.destroy({ where: {} }),
      // FlashSale.destroy({ where: {} })
    ]);
    console.log('Database cleared');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = await User.bulkCreate([
      {
        firstName: 'Joseph',
        lastName: 'Mwangi',
        email: 'jane@jnmcosmetics.com',
        password: hashedPassword,
        phone: '+254712345678',
        role: 'user',
        isVerified: true
      },
      {
        firstName: 'Jude',
        lastName: 'Kimathi',
        email: 'samuel@salvageshop.co.ke',
        password: hashedPassword,
        phone: '+254723456789',
        role: 'user',
        isVerified: true
      },
      {
        firstName: 'Mark',
        lastName: 'Kamau',
        email: 'mark@example.com',
        password: hashedPassword,
        phone: '+254734567890',
        role: 'user',
        isVerified: true
      },
      {
        firstName: 'Sally',
        lastName: 'Wanga',
        email: 'sally@example.com',
        password: hashedPassword,
        phone: '+254745678901',
        role: 'user',
        isVerified: true
      }
    ]);

    console.log('Users created:', users.length);

    // Create detailed merchants
    const merchants = await Merchant.bulkCreate([
      {
        businessName: 'JNM Cosmetics',
        email: 'business@jnmcosmetics.com',
        phone: '+254712345678',
        password: hashedPassword,
        businessType: 'Beauty & Personal Care',
        description: 'Premium beauty and cosmetics store offering authentic skincare, makeup, and beauty accessories. We specialize in both local and international beauty brands with a focus on quality and customer satisfaction.',
        address: '456 Beauty Plaza, Westlands',
        location: 'Nairobi',
        landmark: 'Near Westlands Mall',
        yearEstablished: 2020,
        website: 'https://jnmcosmetics.co.ke',
        businessHours: {
          monday: { open: '8:00 AM', close: '6:00 PM' },
          tuesday: { open: '8:00 AM', close: '6:00 PM' },
          wednesday: { open: '8:00 AM', close: '6:00 PM' },
          thursday: { open: '8:00 AM', close: '6:00 PM' },
          friday: { open: '8:00 AM', close: '6:00 PM' },
          saturday: { open: '9:00 AM', close: '5:00 PM' },
          sunday: { closed: true }
        },
        verified: true,
        verifiedDate: new Date('2023-06-15'),
        rating: 4.8,
        reviews: 156
      },
      {
        businessName: 'Salvage Shop',
        email: 'info@salvageshop.co.ke',
        phone: '+254723456789',
        password: hashedPassword,
        businessType: 'Electronics & Technology',
        description: 'Your one-stop shop for quality electronics, gadgets, and tech accessories. We offer both new and refurbished electronics with warranty coverage. Specializing in smartphones, laptops, home appliances, and gaming equipment.',
        address: '789 Electronics Hub, CBD',
        location: 'Nairobi',
        landmark: 'Opposite Kencom House',
        yearEstablished: 2019,
        website: 'https://salvageshop.co.ke',
        businessHours: {
          monday: { open: '8:00 AM', close: '7:00 PM' },
          tuesday: { open: '8:00 AM', close: '7:00 PM' },
          wednesday: { open: '8:00 AM', close: '7:00 PM' },
          thursday: { open: '8:00 AM', close: '7:00 PM' },
          friday: { open: '8:00 AM', close: '7:00 PM' },
          saturday: { open: '9:00 AM', close: '6:00 PM' },
          sunday: { open: '10:00 AM', close: '4:00 PM' }
        },
        verified: true,
        verifiedDate: new Date('2023-08-20'),
        rating: 4.6,
        reviews: 203
      }
    ]);

    console.log('Merchants created:', merchants.length);

    // Create 50+ products for both merchants
    const jnmCosmetics = merchants[0];
    const salvageShop = merchants[1];

    // Update product data to use Sequelize field names
    const updateProductForSequelize = (product, merchantId, merchantName) => ({
      ...product,
      merchantId,
      merchantName,
      stockQuantity: product.stockQuantity || product.stock || 0,
      featured: product.featured || product.isFeatured || false,
      primaryImage: product.primaryImage || (product.images && product.images[0]) || '',
      // Remove MongoDB-specific fields
      merchant: undefined,
      stock: undefined,
      isFeatured: undefined,
      specifications: product.specifications || {},
      brand: product.brand || null,
      model: product.model || null,
      condition: product.condition || 'new',
      weight: product.weight || null,
      dimensions: product.dimensions || {},
      warranty: product.warranty || null
    });

    const cosmeticsProducts = [
      // Skincare products
      {
        name: 'Nivea Daily Moisturizer',
        description: 'Deep moisturizing cream for all skin types. Enriched with vitamin E and natural oils for soft, smooth skin.',
        price: 850,
        originalPrice: 1200,
        category: 'Beauty',
        subcategory: 'Skincare',
        images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 45,
        featured: true,
        isActive: true,
        tags: ['skincare', 'moisturizer', 'daily care']
      },
      {
        name: 'Olay Regenerist Serum',
        description: 'Anti-aging serum with niacinamide and peptides. Reduces fine lines and improves skin texture.',
        price: 2400,
        originalPrice: 3200,
        category: 'Beauty',
        subcategory: 'Skincare',
        images: ['https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 25,
        featured: true,
        isActive: true,
        tags: ['serum', 'anti-aging', 'skincare']
      },
      {
        name: 'Cetaphil Gentle Cleanser',
        description: 'Gentle daily cleanser for sensitive skin. Soap-free formula that cleanses without stripping natural oils.',
        price: 1200,
        originalPrice: 1500,
        category: 'Beauty',
        subcategory: 'Skincare',
        images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 60,
        isActive: true,
        tags: ['cleanser', 'gentle', 'sensitive skin']
      },
      {
        name: 'The Ordinary Hyaluronic Acid',
        description: 'Hyaluronic acid serum for intense hydration. Plumps skin and reduces appearance of fine lines.',
        price: 1800,
        originalPrice: 2200,
        category: 'Beauty',
        subcategory: 'Skincare',
        images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 35,
        isActive: true,
        tags: ['hyaluronic acid', 'hydration', 'serum']
      },
      
      // Makeup products
      {
        name: 'Maybelline Fit Me Foundation',
        description: 'Natural coverage foundation that matches your skin tone. Oil-free formula for all-day wear.',
        price: 1500,
        originalPrice: 2000,
        category: 'Beauty',
        subcategory: 'Makeup',
        images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 50,
        featured: true,
        isActive: true,
        tags: ['foundation', 'makeup', 'coverage']
      },
      {
        name: 'MAC Ruby Woo Lipstick',
        description: 'Iconic red lipstick with matte finish. Long-wearing formula that provides intense color payoff.',
        price: 2800,
        originalPrice: 3500,
        category: 'Beauty',
        subcategory: 'Makeup',
        images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 30,
        isActive: true,
        tags: ['lipstick', 'red', 'matte']
      },
      {
        name: 'Urban Decay Eyeshadow Palette',
        description: '12-shade eyeshadow palette with mix of matte and shimmer shades. Highly pigmented and blendable.',
        price: 4200,
        originalPrice: 5500,
        category: 'Beauty',
        subcategory: 'Makeup',
        images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 20,
        isActive: true,
        tags: ['eyeshadow', 'palette', 'makeup']
      },
      {
        name: 'Benefit Brow Pencil',
        description: 'Precise brow pencil for natural-looking brows. Includes spoolie brush for blending.',
        price: 1800,
        originalPrice: 2400,
        category: 'Beauty',
        subcategory: 'Makeup',
        images: ['https://images.unsplash.com/photo-1583847266882-503fb9608542?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1583847266882-503fb9608542?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 40,
        isActive: true,
        tags: ['brow pencil', 'eyebrows', 'makeup']
      },
      
      // Hair Care
      {
        name: 'Shea Moisture Curl Cream',
        description: 'Define and moisturize curls with this coconut and hibiscus curl cream. Reduces frizz and adds shine.',
        price: 1600,
        originalPrice: 2000,
        category: 'Beauty',
        subcategory: 'Hair Care',
        images: ['https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 55,
        isActive: true,
        tags: ['curl cream', 'hair care', 'curly hair']
      },
      {
        name: 'Tresemme Keratin Smooth Shampoo',
        description: 'Smoothing shampoo infused with keratin for frizz control. Leaves hair soft and manageable.',
        price: 800,
        originalPrice: 1200,
        category: 'Beauty',
        subcategory: 'Hair Care',
        images: ['https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 65,
        isActive: true,
        tags: ['shampoo', 'keratin', 'frizz control']
      },
      
      // Fragrance
      {
        name: 'Victoria Secret Bombshell',
        description: 'Floral and fruity fragrance mist. Perfect for everyday wear with notes of passion flower and peony.',
        price: 2200,
        originalPrice: 2800,
        category: 'Beauty',
        subcategory: 'Fragrance',
        images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 25,
        isActive: true,
        tags: ['fragrance', 'mist', 'floral']
      },
      {
        name: 'Bath & Body Works Lotion',
        description: 'Moisturizing body lotion with signature scent. Enriched with shea butter and vitamin E.',
        price: 1400,
        originalPrice: 1800,
        category: 'Beauty',
        subcategory: 'Body Care',
        images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 45,
        isActive: true,
        tags: ['body lotion', 'moisturizer', 'scented']
      },
      
      // Tools & Accessories
      {
        name: 'Real Techniques Makeup Brush Set',
        description: 'Professional makeup brush set with synthetic bristles. Includes foundation, powder, and eye brushes.',
        price: 2500,
        originalPrice: 3200,
        category: 'Beauty',
        subcategory: 'Tools & Accessories',
        images: ['https://images.unsplash.com/photo-1583847266882-503fb9608542?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1583847266882-503fb9608542?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 30,
        isActive: true,
        tags: ['makeup brushes', 'tools', 'professional']
      },
      {
        name: 'Foreo Luna Mini Cleanser',
        description: 'Sonic facial cleansing device for deep pore cleansing. Gentle silicone bristles for all skin types.',
        price: 8500,
        originalPrice: 12000,
        category: 'Beauty',
        subcategory: 'Tools & Accessories',
        images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 15,
        featured: true,
        isActive: true,
        tags: ['facial cleanser', 'sonic', 'device']
      },
      
      // Men's Grooming
      {
        name: 'Nivea Men Face Wash',
        description: 'Deep cleansing face wash for men. Removes dirt and oil while being gentle on skin.',
        price: 650,
        originalPrice: 900,
        category: 'Beauty',
        subcategory: 'Men\'s Grooming',
        images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 50,
        isActive: true,
        tags: ['face wash', 'men', 'cleansing']
      },
      {
        name: 'Gillette Fusion Razor',
        description: 'Five-blade razor for the closest shave. Precision trimmer for hard-to-reach areas.',
        price: 1200,
        originalPrice: 1600,
        category: 'Beauty',
        subcategory: 'Men\'s Grooming',
        images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 35,
        isActive: true,
        tags: ['razor', 'shaving', 'men']
      },
      
      // Nail Care
      {
        name: 'OPI Nail Polish Set',
        description: 'Set of 5 popular nail polish colors. Long-lasting formula with chip-resistant finish.',
        price: 3200,
        originalPrice: 4000,
        category: 'Beauty',
        subcategory: 'Nail Care',
        images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 25,
        isActive: true,
        tags: ['nail polish', 'set', 'colors']
      },
      {
        name: 'Sally Hansen Cuticle Oil',
        description: 'Nourishing cuticle oil with vitamin E. Softens cuticles and strengthens nails.',
        price: 800,
        originalPrice: 1200,
        category: 'Beauty',
        subcategory: 'Nail Care',
        images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 40,
        isActive: true,
        tags: ['cuticle oil', 'nail care', 'vitamin E']
      },
      
      // Suncare
      {
        name: 'Neutrogena Sunscreen SPF 50',
        description: 'Broad spectrum sunscreen with SPF 50. Water-resistant formula perfect for daily use.',
        price: 1400,
        originalPrice: 1800,
        category: 'Beauty',
        subcategory: 'Suncare',
        images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 45,
        isActive: true,
        tags: ['sunscreen', 'SPF 50', 'protection']
      },
      {
        name: 'Banana Boat After Sun Lotion',
        description: 'Soothing after-sun lotion with aloe vera. Helps restore moisture after sun exposure.',
        price: 900,
        originalPrice: 1300,
        category: 'Beauty',
        subcategory: 'Suncare',
        images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 35,
        isActive: true,
        tags: ['after sun', 'aloe vera', 'soothing']
      },
      
      // Bath & Shower
      {
        name: 'Dove Beauty Bar Soap',
        description: 'Moisturizing beauty bar with 1/4 moisturizing cream. Gentle cleansing for soft skin.',
        price: 450,
        originalPrice: 650,
        category: 'Beauty',
        subcategory: 'Bath & Shower',
        images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 80,
        isActive: true,
        tags: ['beauty bar', 'soap', 'moisturizing']
      },
      {
        name: 'Johnson\'s Baby Shampoo',
        description: 'No More Tears formula baby shampoo. Gentle cleansing for delicate hair and scalp.',
        price: 600,
        originalPrice: 850,
        category: 'Beauty',
        subcategory: 'Bath & Shower',
        images: ['https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 60,
        isActive: true,
        tags: ['baby shampoo', 'gentle', 'no tears']
      },
      
      // Deodorants
      {
        name: 'Rexona Antiperspirant',
        description: '48-hour protection antiperspirant. Keeps you dry and fresh all day long.',
        price: 550,
        originalPrice: 750,
        category: 'Beauty',
        subcategory: 'Deodorants',
        images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 70,
        isActive: true,
        tags: ['antiperspirant', 'deodorant', '48 hour']
      },
      {
        name: 'Nivea Invisible Deodorant',
        description: 'Black and white invisible deodorant. No white marks on black clothes, no stains on white clothes.',
        price: 650,
        originalPrice: 900,
        category: 'Beauty',
        subcategory: 'Deodorants',
        images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'],
        primaryImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
        merchant: jnmCosmetics._id,
        merchantName: 'JNM Cosmetics',
        stockQuantity: 55,
        isActive: true,
        tags: ['invisible deodorant', 'no marks', 'no stains']
      }
    ];

    // Electronics products for Salvage Shop
    const electronicsProducts = [
      // Smartphones
      {
        name: 'Samsung Galaxy A54 5G',
        description: 'Latest Samsung Galaxy A54 with 5G connectivity. 6.4" Super AMOLED display, 50MP camera, 128GB storage.',
        price: 45000,
        originalPrice: 52000,
        category: 'Electronics',
        subcategory: 'Smartphones',
        images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'],
        brand: 'Samsung',
        stock: 25,
        specifications: {
          'Display': '6.4" Super AMOLED',
          'Camera': '50MP + 12MP + 5MP',
          'Storage': '128GB',
          'RAM': '6GB',
          'Battery': '5000mAh',
          'OS': 'Android 13'
        },
        features: ['5G connectivity', '50MP camera', '5000mAh battery', 'Water resistant'],
        merchant: salvageShop._id,
        isActive: true,
        isFeatured: true,
        tags: ['smartphone', 'samsung', '5G', 'android']
      },
      {
        name: 'iPhone 14 Pro Max',
        description: 'Apple iPhone 14 Pro Max with A16 Bionic chip. 6.7" ProMotion display, 48MP camera system.',
        price: 145000,
        originalPrice: 165000,
        category: 'Electronics',
        subcategory: 'Smartphones',
        images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'],
        brand: 'Apple',
        stock: 15,
        specifications: {
          'Display': '6.7" ProMotion',
          'Chip': 'A16 Bionic',
          'Camera': '48MP Pro camera system',
          'Storage': '256GB',
          'RAM': '6GB',
          'Battery': 'All-day battery',
          'OS': 'iOS 16'
        },
        features: ['A16 Bionic chip', 'ProMotion display', '48MP cameras', 'All-day battery'],
        merchant: salvageShop._id,
        isActive: true,
        isFeatured: true,
        tags: ['iphone', 'apple', 'pro max', 'ios']
      },
      {
        name: 'Xiaomi Redmi Note 12',
        description: 'Affordable Xiaomi Redmi Note 12 with excellent performance. 6.67" AMOLED display, 50MP camera.',
        price: 28000,
        originalPrice: 32000,
        category: 'Electronics',
        subcategory: 'Smartphones',
        images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'],
        brand: 'Xiaomi',
        stock: 35,
        specifications: {
          'Display': '6.67" AMOLED',
          'Processor': 'Snapdragon 685',
          'Camera': '50MP + 8MP + 2MP',
          'Storage': '128GB',
          'RAM': '6GB',
          'Battery': '5000mAh',
          'OS': 'MIUI 14'
        },
        features: ['AMOLED display', 'Fast charging', 'Long battery life', 'Great cameras'],
        merchant: salvageShop._id,
        isActive: true,
        tags: ['xiaomi', 'redmi', 'affordable', 'android']
      },
      
      // Laptops
      {
        name: 'MacBook Air M2',
        description: 'Apple MacBook Air with M2 chip. 13.6" Liquid Retina display, 8GB RAM, 256GB SSD.',
        price: 125000,
        originalPrice: 145000,
        category: 'Electronics',
        subcategory: 'Laptops',
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
        brand: 'Apple',
        stock: 12,
        specifications: {
          'Display': '13.6" Liquid Retina',
          'Processor': 'Apple M2',
          'RAM': '8GB',
          'Storage': '256GB SSD',
          'Battery': 'Up to 18 hours',
          'Weight': '1.24kg',
          'OS': 'macOS'
        },
        features: ['M2 chip performance', 'All-day battery', 'Lightweight design', 'Retina display'],
        merchant: salvageShop._id,
        isActive: true,
        isFeatured: true,
        tags: ['macbook', 'apple', 'M2', 'laptop']
      },
      {
        name: 'HP Pavilion 15',
        description: 'HP Pavilion 15 with Intel Core i5. 15.6" Full HD display, 8GB RAM, 512GB SSD.',
        price: 65000,
        originalPrice: 75000,
        category: 'Electronics',
        subcategory: 'Laptops',
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
        brand: 'HP',
        stock: 20,
        specifications: {
          'Display': '15.6" Full HD',
          'Processor': 'Intel Core i5-1235U',
          'RAM': '8GB DDR4',
          'Storage': '512GB SSD',
          'Graphics': 'Intel Iris Xe',
          'Battery': 'Up to 8 hours',
          'OS': 'Windows 11'
        },
        features: ['Intel Core i5', 'Fast SSD storage', 'Full HD display', 'Windows 11'],
        merchant: salvageShop._id,
        isActive: true,
        tags: ['hp', 'pavilion', 'intel', 'windows']
      },
      {
        name: 'Dell Inspiron 14',
        description: 'Dell Inspiron 14 for productivity. AMD Ryzen 5, 14" display, 16GB RAM, 512GB SSD.',
        price: 58000,
        originalPrice: 68000,
        category: 'Electronics',
        subcategory: 'Laptops',
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
        brand: 'Dell',
        stock: 18,
        specifications: {
          'Display': '14" Full HD',
          'Processor': 'AMD Ryzen 5 5500U',
          'RAM': '16GB DDR4',
          'Storage': '512GB SSD',
          'Graphics': 'AMD Radeon',
          'Battery': 'Up to 10 hours',
          'OS': 'Windows 11'
        },
        features: ['AMD Ryzen 5', 'Ample RAM', 'Compact design', 'Long battery life'],
        merchant: salvageShop._id,
        isActive: true,
        tags: ['dell', 'inspiron', 'ryzen', 'productivity']
      },
      
      // Headphones & Audio
      {
        name: 'Sony WH-1000XM5',
        description: 'Premium noise-canceling headphones. Industry-leading ANC, 30-hour battery life.',
        price: 28000,
        originalPrice: 35000,
        category: 'Electronics',
        subcategory: 'Audio',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
        brand: 'Sony',
        stock: 30,
        specifications: {
          'Type': 'Over-ear headphones',
          'Noise Cancellation': 'Industry-leading ANC',
          'Battery': '30 hours',
          'Connectivity': 'Bluetooth 5.2',
          'Driver': '30mm',
          'Weight': '250g'
        },
        features: ['Industry-leading ANC', '30-hour battery', 'Premium sound', 'Comfortable fit'],
        merchant: salvageShop._id,
        isActive: true,
        isFeatured: true,
        tags: ['sony', 'headphones', 'noise cancelling', 'bluetooth']
      },
      {
        name: 'JBL Charge 5',
        description: 'Portable Bluetooth speaker with powerful sound. IP67 waterproof, 20-hour playtime.',
        price: 12000,
        originalPrice: 15000,
        category: 'Electronics',
        subcategory: 'Audio',
        images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400'],
        brand: 'JBL',
        stock: 45,
        specifications: {
          'Type': 'Portable speaker',
          'Waterproof': 'IP67',
          'Battery': '20 hours',
          'Connectivity': 'Bluetooth 5.1',
          'Power': '40W',
          'Weight': '960g'
        },
        features: ['IP67 waterproof', '20-hour battery', 'Powerful sound', 'Portable design'],
        merchant: salvageShop._id,
        isActive: true,
        tags: ['jbl', 'speaker', 'bluetooth', 'waterproof']
      },
      {
        name: 'AirPods Pro 2nd Gen',
        description: 'Apple AirPods Pro with H2 chip. Active noise cancellation, spatial audio, 6-hour battery.',
        price: 22000,
        originalPrice: 28000,
        category: 'Electronics',
        subcategory: 'Audio',
        images: ['https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400'],
        brand: 'Apple',
        stock: 25,
        specifications: {
          'Type': 'True wireless earbuds',
          'Chip': 'H2 chip',
          'Noise Cancellation': 'Active ANC',
          'Battery': '6 hours + 24 hours case',
          'Connectivity': 'Bluetooth 5.3',
          'Features': 'Spatial audio'
        },
        features: ['H2 chip', 'Active noise cancellation', 'Spatial audio', 'Long battery life'],
        merchant: salvageShop._id,
        isActive: true,
        tags: ['airpods', 'apple', 'wireless', 'anc']
      },
      
      // Gaming
      {
        name: 'PlayStation 5',
        description: 'Sony PlayStation 5 console. Lightning-fast SSD, ray tracing, 4K gaming, DualSense controller.',
        price: 65000,
        originalPrice: 75000,
        category: 'Electronics',
        subcategory: 'Gaming',
        images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400'],
        brand: 'Sony',
        stock: 10,
        specifications: {
          'CPU': 'AMD Zen 2',
          'GPU': 'AMD RDNA 2',
          'Storage': '825GB SSD',
          'RAM': '16GB GDDR6',
          'Resolution': '4K gaming',
          'Controller': 'DualSense wireless'
        },
        features: ['Lightning-fast SSD', 'Ray tracing', '4K gaming', 'DualSense controller'],
        merchant: salvageShop._id,
        isActive: true,
        isFeatured: true,
        tags: ['playstation', 'gaming', 'console', '4K']
      },
      {
        name: 'Xbox Series X',
        description: 'Microsoft Xbox Series X. 4K gaming, 120fps, 1TB SSD, backwards compatibility.',
        price: 58000,
        originalPrice: 68000,
        category: 'Electronics',
        subcategory: 'Gaming',
        images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400'],
        brand: 'Microsoft',
        stock: 12,
        specifications: {
          'CPU': 'AMD Zen 2',
          'GPU': 'AMD RDNA 2',
          'Storage': '1TB SSD',
          'RAM': '16GB GDDR6',
          'Resolution': '4K gaming',
          'FPS': 'Up to 120fps'
        },
        features: ['4K gaming', '120fps capability', 'Fast SSD', 'Backwards compatible'],
        merchant: salvageShop._id,
        isActive: true,
        tags: ['xbox', 'gaming', 'console', '4K']
      },
      
      // Tablets
      {
        name: 'iPad Air 5th Gen',
        description: 'Apple iPad Air with M1 chip. 10.9" Liquid Retina display, 64GB storage, Apple Pencil support.',
        price: 58000,
        originalPrice: 68000,
        category: 'Electronics',
        subcategory: 'Tablets',
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400'],
        brand: 'Apple',
        stock: 22,
        specifications: {
          'Display': '10.9" Liquid Retina',
          'Chip': 'Apple M1',
          'Storage': '64GB',
          'Camera': '12MP Wide',
          'Battery': 'Up to 10 hours',
          'Connectivity': 'Wi-Fi 6'
        },
        features: ['M1 chip performance', 'Apple Pencil support', 'All-day battery', 'Retina display'],
        merchant: salvageShop._id,
        isActive: true,
        tags: ['ipad', 'apple', 'tablet', 'M1']
      },
      {
        name: 'Samsung Galaxy Tab S8',
        description: 'Samsung Galaxy Tab S8 with S Pen. 11" display, Snapdragon 8 Gen 1, 128GB storage.',
        price: 48000,
        originalPrice: 58000,
        category: 'Electronics',
        subcategory: 'Tablets',
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400'],
        brand: 'Samsung',
        stock: 18,
        specifications: {
          'Display': '11" TFT LCD',
          'Processor': 'Snapdragon 8 Gen 1',
          'Storage': '128GB',
          'RAM': '8GB',
          'Camera': '13MP + 6MP',
          'Battery': '8000mAh',
          'S Pen': 'Included'
        },
        features: ['S Pen included', 'Powerful processor', 'Large battery', 'Versatile design'],
        merchant: salvageShop._id,
        isActive: true,
        tags: ['samsung', 'tablet', 'galaxy tab', 's pen']
      },
      
      // Smart Watches
      {
        name: 'Apple Watch Series 9',
        description: 'Apple Watch Series 9 with S9 chip. 45mm case, GPS, health tracking, always-on display.',
        price: 38000,
        originalPrice: 45000,
        category: 'Electronics',
        subcategory: 'Wearables',
        images: ['https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400'],
        brand: 'Apple',
        stock: 28,
        specifications: {
          'Display': '45mm Always-On Retina',
          'Chip': 'S9 SiP',
          'Storage': '64GB',
          'Connectivity': 'GPS + Cellular',
          'Health': 'Heart rate, ECG, Blood oxygen',
          'Battery': '18 hours'
        },
        features: ['S9 chip', 'Health tracking', 'Always-on display', 'GPS + Cellular'],
        merchant: salvageShop._id,
        isActive: true,
        tags: ['apple watch', 'smartwatch', 'fitness', 'health']
      },
      {
        name: 'Samsung Galaxy Watch 6',
        description: 'Samsung Galaxy Watch 6 with Wear OS. 44mm case, health monitoring, 40-hour battery.',
        price: 28000,
        originalPrice: 35000,
        category: 'Electronics',
        subcategory: 'Wearables',
        images: ['https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400'],
        brand: 'Samsung',
        stock: 25,
        specifications: {
          'Display': '44mm Super AMOLED',
          'OS': 'Wear OS',
          'Storage': '16GB',
          'Connectivity': 'Bluetooth 5.3',
          'Health': 'Heart rate, Sleep, Stress',
          'Battery': '40 hours'
        },
        features: ['Wear OS', 'Health monitoring', '40-hour battery', 'Stylish design'],
        merchant: salvageShop._id,
        isActive: true,
        tags: ['galaxy watch', 'samsung', 'wear os', 'fitness']
      },
      
      // Cameras
      {
        name: 'Canon EOS M50 Mark II',
        description: 'Canon mirrorless camera with 24.1MP sensor. 4K video, Wi-Fi, Bluetooth connectivity.',
        price: 55000,
        originalPrice: 65000,
        category: 'Electronics',
        subcategory: 'Cameras',
        images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400'],
        brand: 'Canon',
        stock: 15,
        specifications: {
          'Sensor': '24.1MP APS-C CMOS',
          'Video': '4K UHD',
          'LCD': '3.0" Vari-angle touchscreen',
          'Connectivity': 'Wi-Fi + Bluetooth',
          'Lens Mount': 'EF-M',
          'Weight': '387g'
        },
        features: ['24.1MP sensor', '4K video', 'Wi-Fi connectivity', 'Compact design'],
        merchant: salvageShop._id,
        isActive: true,
        tags: ['canon', 'camera', 'mirrorless', '4K']
      },
      {
        name: 'GoPro Hero 12',
        description: 'GoPro Hero 12 action camera. 5.3K video, waterproof, image stabilization, voice control.',
        price: 42000,
        originalPrice: 52000,
        category: 'Electronics',
        subcategory: 'Cameras',
        images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400'],
        brand: 'GoPro',
        stock: 20,
        specifications: {
          'Video': '5.3K60 + 4K120',
          'Photo': '27MP',
          'Waterproof': '10m without housing',
          'Stabilization': 'HyperSmooth 6.0',
          'Voice Control': 'Yes',
          'Battery': '1720mAh'
        },
        features: ['5.3K video', 'Waterproof', 'Image stabilization', 'Voice control'],
        merchant: salvageShop._id,
        isActive: true,
        tags: ['gopro', 'action camera', 'waterproof', '5K']
      },
      
      // TV & Home Entertainment
      {
        name: 'Samsung 55" 4K Smart TV',
        description: 'Samsung 55" 4K UHD Smart TV. Crystal processor, HDR, Tizen OS, voice control.',
        price: 85000,
        originalPrice: 105000,
        category: 'Electronics',
        subcategory: 'TV & Home Entertainment',
        images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400'],
        brand: 'Samsung',
        stock: 8,
        specifications: {
          'Display': '55" 4K UHD',
          'Processor': 'Crystal Processor 4K',
          'HDR': 'HDR10+',
          'OS': 'Tizen OS',
          'Connectivity': 'Wi-Fi, Bluetooth',
          'Ports': '3x HDMI, 2x USB'
        },
        features: ['4K UHD display', 'Smart TV features', 'Voice control', 'Multiple streaming apps'],
        merchant: salvageShop._id,
        isActive: true,
        isFeatured: true,
        tags: ['samsung', 'smart tv', '4K', 'UHD']
      },
      {
        name: 'LG 43" Full HD Smart TV',
        description: 'LG 43" Full HD Smart TV with webOS. AI ThinQ, HDR10, multiple connectivity options.',
        price: 45000,
        originalPrice: 55000,
        category: 'Electronics',
        subcategory: 'TV & Home Entertainment',
        images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400'],
        brand: 'LG',
        stock: 12,
        specifications: {
          'Display': '43" Full HD',
          'OS': 'webOS',
          'AI': 'ThinQ AI',
          'HDR': 'HDR10',
          'Connectivity': 'Wi-Fi, Bluetooth',
          'Ports': '2x HDMI, 1x USB'
        },
        features: ['webOS smart platform', 'AI ThinQ', 'HDR10', 'Voice remote'],
        merchant: salvageShop._id,
        isActive: true,
        tags: ['lg', 'smart tv', 'webos', 'ai']
      },
      
      // Home Appliances
      {
        name: 'Dyson V15 Detect',
        description: 'Dyson V15 Detect cordless vacuum. Laser detection, 60-minute runtime, HEPA filtration.',
        price: 58000,
        originalPrice: 68000,
        category: 'Electronics',
        subcategory: 'Home Appliances',
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
        brand: 'Dyson',
        stock: 15,
        specifications: {
          'Type': 'Cordless vacuum',
          'Runtime': '60 minutes',
          'Filtration': 'HEPA',
          'Detection': 'Laser dust detection',
          'Weight': '3.1kg',
          'Bin Capacity': '0.76L'
        },
        features: ['Laser dust detection', '60-minute runtime', 'HEPA filtration', 'Lightweight'],
        merchant: salvageShop._id,
        isActive: true,
        tags: ['dyson', 'vacuum', 'cordless', 'hepa']
      },
      {
        name: 'Philips Air Fryer XXL',
        description: 'Philips Airfryer XXL with Rapid Air technology. 7.3L capacity, healthier cooking with little oil.',
        price: 28000,
        originalPrice: 35000,
        category: 'Electronics',
        subcategory: 'Home Appliances',
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
        brand: 'Philips',
        stock: 20,
        specifications: {
          'Capacity': '7.3L',
          'Technology': 'Rapid Air',
          'Temperature': '80-200°C',
          'Power': '2225W',
          'Cooking Programs': '13 preset',
          'Dishwasher Safe': 'Yes'
        },
        features: ['7.3L capacity', 'Rapid Air technology', 'Healthier cooking', '13 preset programs'],
        merchant: salvageShop._id,
        isActive: true,
        tags: ['philips', 'air fryer', 'healthy cooking', 'rapid air']
      },
      
      // Computer Accessories
      {
        name: 'Logitech MX Master 3S',
        description: 'Logitech MX Master 3S wireless mouse. Precision tracking, 70-day battery, customizable buttons.',
        price: 8500,
        originalPrice: 11000,
        category: 'Electronics',
        subcategory: 'Computer Accessories',
        images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'],
        brand: 'Logitech',
        stock: 35,
        specifications: {
          'Type': 'Wireless mouse',
          'Sensor': '8000 DPI',
          'Battery': '70 days',
          'Connectivity': 'Bluetooth + USB receiver',
          'Buttons': '7 customizable',
          'Weight': '141g'
        },
        features: ['Precision tracking', '70-day battery', 'Customizable buttons', 'Multi-device'],
        merchant: salvageShop._id,
        isActive: true,
        tags: ['logitech', 'mouse', 'wireless', 'productivity']
      },
      {
        name: 'Razer BlackWidow V4',
        description: 'Razer BlackWidow V4 mechanical gaming keyboard. Green switches, RGB lighting, programmable keys.',
        price: 12000,
        originalPrice: 15000,
        category: 'Electronics',
        subcategory: 'Computer Accessories',
        images: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400'],
        brand: 'Razer',
        stock: 25,
        specifications: {
          'Type': 'Mechanical keyboard',
          'Switches': 'Razer Green',
          'Lighting': 'RGB Chroma',
          'Keys': 'Programmable',
          'Connection': 'USB-C',
          'Layout': 'Full-size'
        },
        features: ['Mechanical switches', 'RGB lighting', 'Programmable keys', 'Gaming optimized'],
        merchant: salvageShop._id,
        isActive: true,
        tags: ['razer', 'keyboard', 'mechanical', 'gaming']
      }
    ];

    // Insert all products
    const cosmeticsProductsUpdated = cosmeticsProducts.map(product =>
      updateProductForSequelize(product, jnmCosmetics.id, jnmCosmetics.businessName)
    );
    const electronicsProductsUpdated = electronicsProducts.map(product =>
      updateProductForSequelize(product, salvageShop.id, salvageShop.businessName)
    );
    const allProducts = [...cosmeticsProductsUpdated, ...electronicsProductsUpdated];
    const insertedProducts = await Product.bulkCreate(allProducts);
    console.log('Products created:', insertedProducts.length);

    // TODO: Convert FlashSale model to Sequelize
    // Create flash sales with products from both merchants
    /*
    const flashSaleProducts = [
      // JNM Cosmetics flash sale items
      insertedProducts.find(p => p.name === 'Nivea Daily Moisturizer'),
      insertedProducts.find(p => p.name === 'Maybelline Fit Me Foundation'),
      insertedProducts.find(p => p.name === 'Urban Decay Eyeshadow Palette'),
      insertedProducts.find(p => p.name === 'Foreo Luna Mini Cleanser'),
      insertedProducts.find(p => p.name === 'OPI Nail Polish Set'),
      insertedProducts.find(p => p.name === 'Victoria Secret Bombshell'),
      insertedProducts.find(p => p.name === 'Real Techniques Makeup Brush Set'),
      // Salvage Shop flash sale items
      insertedProducts.find(p => p.name === 'Samsung Galaxy A54 5G'),
      insertedProducts.find(p => p.name === 'Sony WH-1000XM5'),
      insertedProducts.find(p => p.name === 'JBL Charge 5'),
      insertedProducts.find(p => p.name === 'Apple Watch Series 9'),
      insertedProducts.find(p => p.name === 'GoPro Hero 12'),
      insertedProducts.find(p => p.name === 'Philips Air Fryer XXL'),
      insertedProducts.find(p => p.name === 'Logitech MX Master 3S')
    ].filter(Boolean);

    const flashSales = await FlashSale.bulkCreate(
      flashSaleProducts.map(product => ({
        productId: product.id,
        originalPrice: product.originalPrice,
        salePrice: product.price,
        discountPercentage: Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100),
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: true,
        stock: product.stockQuantity,
        maxQuantityPerUser: 3,
        merchantId: product.merchantId
      }))
    );

    console.log('Flash sales created:', flashSales.length);
    */

    console.log('Database seeded successfully!');
    console.log('Summary:');
    console.log('- Users:', users.length);
    console.log('- Merchants:', merchants.length);
    console.log('- Products:', insertedProducts.length);
    console.log('- Flash Sales: 0 (TODO: Convert FlashSale model to Sequelize)');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

module.exports = seedDatabase;

// Run if called directly
if (require.main === module) {
  seedDatabase();
}
