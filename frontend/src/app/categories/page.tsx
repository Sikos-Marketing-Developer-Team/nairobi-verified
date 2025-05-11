"use client";

import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';

const categories = [
  {
    id: 1,
    name: 'Electronics',
    slug: 'electronics',
    description: 'TVs, Cell Phones, Laptops and More!',
    image: '/images/categories/electronics.jpg',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    productCount: 54
  },
  {
    id: 2,
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing, Shoes, Accessories and More!',
    image: '/images/categories/fashion.jpg',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    productCount: 22
  },
  {
    id: 3,
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Furniture, Kitchen, Lighting and More!',
    image: '/images/categories/home-garden.jpg',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    productCount: 35
  },
  {
    id: 4,
    name: 'Health & Beauty',
    slug: 'health-beauty',
    description: 'Skincare, Makeup, Personal Care and More!',
    image: '/images/categories/health-beauty.jpg',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    productCount: 18
  },
  {
    id: 5,
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Fitness, Camping, Hiking and More!',
    image: '/images/categories/sports-outdoors.jpg',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    productCount: 15
  },
  {
    id: 6,
    name: 'Books & Stationery',
    slug: 'books-stationery',
    description: 'Books, Notebooks, Pens and More!',
    image: '/images/categories/books-stationery.jpg',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    productCount: 12
  },
  {
    id: 7,
    name: 'Toys & Games',
    slug: 'toys-games',
    description: 'Board Games, Puzzles, Action Figures and More!',
    image: '/images/categories/toys-games.jpg',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    productCount: 8
  },
  {
    id: 8,
    name: 'Automotive',
    slug: 'automotive',
    description: 'Car Accessories, Parts, Tools and More!',
    image: '/images/categories/automotive.jpg',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    productCount: 10
  },
  {
    id: 9,
    name: 'Pet Supplies',
    slug: 'pet-supplies',
    description: 'Food, Toys, Accessories and More!',
    image: '/images/categories/pet-supplies.jpg',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    productCount: 6
  }
];

export default function CategoriesPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shop by Category</h1>
          <p className="text-gray-600">Browse our wide selection of products by category</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className={`${category.bgColor} rounded-lg overflow-hidden transition-transform hover:scale-105`}
            >
              <div className="relative h-64">
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                  <div>
                    <h3 className={`text-2xl font-bold ${category.textColor} mb-2`}>
                      {category.name}
                    </h3>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">{category.productCount} products</span>
                    <button className="bg-white text-gray-800 px-4 py-2 rounded-md w-max hover:bg-gray-50">
                      View All
                    </button>
                  </div>
                </div>
                <Image
                  src={category.image}
                  alt={category.name}
                  width={400}
                  height={400}
                  className="absolute right-0 bottom-0 w-2/3 h-2/3 object-cover"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}