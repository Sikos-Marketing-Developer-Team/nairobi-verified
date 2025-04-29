"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function Categories() {
  const [categories] = useState([
    {
      id: 1,
      name: "Electronics",
      image: "/images/categories/electronics.jpg",
      description: "Latest gadgets and electronic devices",
      count: 24
    },
    {
      id: 2,
      name: "Fashion",
      image: "/images/categories/fashion.jpg",
      description: "Clothing, shoes, and accessories",
      count: 36
    },
    {
      id: 3,
      name: "Home & Garden",
      image: "/images/categories/home.jpg",
      description: "Furniture, decor, and garden supplies",
      count: 18
    },
    {
      id: 4,
      name: "Beauty & Health",
      image: "/images/categories/beauty.jpg",
      description: "Cosmetics, personal care, and wellness products",
      count: 29
    },
    {
      id: 5,
      name: "Food & Groceries",
      image: "/images/categories/food.jpg",
      description: "Fresh produce, packaged foods, and beverages",
      count: 15
    },
    {
      id: 6,
      name: "Books & Stationery",
      image: "/images/categories/books.jpg",
      description: "Books, office supplies, and stationery items",
      count: 22
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Browse Categories</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <div className="text-4xl text-gray-400">
                  <i className="bx bx-image"></i>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{category.name}</h3>
                <p className="text-gray-600 mb-3">{category.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{category.count} vendors</span>
                  <a 
                    href={`/categories/${category.id}`} 
                    className="text-[#EC5C0B] hover:text-[#C94A06] font-medium"
                  >
                    Browse
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}