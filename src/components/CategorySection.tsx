import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    id: '60d0fe4f5311236168a10101',
    name: 'Electronics',
    count: '500+ Products',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=200&fit=crop',
    color: 'bg-blue-100'
  },
  {
    id: '60d0fe4f5311236168a10102',
    name: 'Fashion & Clothing',
    count: '800+ Products',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop',
    color: 'bg-pink-100'
  },
  {
    id: '60d0fe4f5311236168a10103',
    name: 'Home & Garden',
    count: '300+ Products',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
    color: 'bg-green-100'
  },
  {
    id: '60d0fe4f5311236168a10104',
    name: 'Books & Media',
    count: '200+ Products',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop',
    color: 'bg-yellow-100'
  },
  {
    id: '60d0fe4f5311236168a10105',
    name: 'Sports & Fitness',
    count: '150+ Products',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
    color: 'bg-purple-100'
  },
  {
    id: '60d0fe4f5311236168a10106',
    name: 'Health & Beauty',
    count: '400+ Products',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop',
    color: 'bg-indigo-100'
  }
];

const CategorySection = () => {
  return (
    <section className="pt-26 pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:pt-12 sm:pb-6 lg:pt-16 lg:pb-8">
        <div className="text-center mb-12 lg:mt-5">
          <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4 pt-2">
            Shop by Category
          </h2>
          <p className="text-xl text-gray-600">
            Explore products from verified merchants across different categories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.id} to={`/products?category=${category.name.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`}>
              <Card className="hover-scale cursor-pointer border-0 shadow-lg">
                <CardContent className="p-0">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-semibold">{category.name}</h3>
                      <p className="text-sm opacity-90">{category.count}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Verified merchants only</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link to="/categories">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              View All Categories
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
