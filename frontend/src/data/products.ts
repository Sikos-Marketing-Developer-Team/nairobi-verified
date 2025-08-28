export type Product = {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  merchant: string;
  location: string;
  verified: boolean;
  featured: boolean;
  merchantId: string;
  category: string;
  description?: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: 'MacBook Pro 16-inch M3',
    price: 185000,
    originalPrice: 250000,
    rating: 4.8,
    reviews: 24,
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
    merchant: 'TechHub Kenya',
    location: 'Kimathi Street, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10101',
    category: 'Electronics',
    description:
      'The MacBook Pro 16-inch with M3 chip delivers unmatched performance, a stunning Retina display, and all-day battery life.'
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    price: 120000,
    originalPrice: 150000,
    rating: 4.7,
    reviews: 32,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    merchant: 'Mobile World CBD',
    location: 'Tom Mboya Street, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10102',
    category: 'Electronics',
    description:
      'Samsung’s latest Galaxy S24 Ultra with a 200MP camera, powerful Snapdragon chip, and long-lasting battery.'
  },
{
    id: 3,
    name: 'Designer Leather Handbag',
    price: 8500,
    originalPrice: 15000,
    rating: 4.4,
    reviews: 18,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=300&fit=crop',
    merchant: 'Fashion House CBD',
    location: 'River Road, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10106',
    category: 'Fashion'
  },
  {
    id: 4,
    name: 'Canon EOS R5 Camera',
    price: 75000,
    originalPrice: 95000,
    rating: 4.9,
    reviews: 15,
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop',
    merchant: 'PhotoPro Kenya',
    location: 'Koinange Street, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10104',
    category: 'Electronics'
  },
  {
    id: 5,
    name: 'Sony WH-1000XM5 Headphones',
    price: 32000,
    originalPrice: 45000,
    rating: 4.6,
    reviews: 28,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    merchant: 'Audio Excellence',
    location: 'Moi Avenue, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10105',
    category: 'Electronics'
  },
  {
    id: 6,
    name: 'Premium Watch Collection',
    price: 16000,
    originalPrice: 25000,
    rating: 4.7,
    reviews: 12,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    merchant: 'Time Pieces Kenya',
    location: 'Kenyatta Avenue, CBD',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10107',
    category: 'Fashion'
  },
  {
    id: 7,
    name: 'Smart Fitness Watch',
    price: 8500,
    originalPrice: 12000,
    rating: 4.4,
    reviews: 35,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
    merchant: 'FitTech Kenya',
    location: 'Westlands, Nairobi',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10109',
    category: 'Electronics'
  },
  {
    id: 8,
    name: 'Gaming Mechanical Keyboard',
    price: 6500,
    originalPrice: 9000,
    rating: 4.3,
    reviews: 25,
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop',
    merchant: 'Gaming Hub Kenya',
    location: 'Sarit Centre, Westlands',
    verified: true,
    featured: true,
    merchantId: '60d0fe4f5311236168a10108',
    category: 'Electronics'
  }
];
