"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";
import { 
  FaShoppingBag, 
  FaHeart, 
  FaUser, 
  FaStore, 
  FaSearch, 
  FaMapMarkerAlt, 
  FaTag, 
  FaBell, 
  FaCreditCard, 
  FaBox,
  FaChevronRight,
  FaShoppingCart,
  FaPercent,
  FaBolt,
  FaRegClock,
  FaStar
} from "react-icons/fa";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Mock data interfaces
  interface Order {
    id: string;
    date: string;
    status: string;
    total: number;
    items: number;
  }

  interface Vendor {
    id: number;
    name: string;
    category: string;
    image: string;
    rating: number;
    location: string;
  }

  interface Product {
    id: number;
    name: string;
    price: number;
    discountPrice?: number;
    image: string;
    category: string;
    vendor: string;
    rating: number;
    isNew?: boolean;
    isFeatured?: boolean;
    isFlashSale?: boolean;
  }

  interface Category {
    id: number;
    name: string;
    icon: string;
    count: number;
  }

  interface FlashSale {
    id: number;
    product: Product;
    discount: number;
    endsAt: string;
  }

  // State for user data
  const [userData, setUserData] = useState<{
    fullName: string;
    email: string;
    phone: string;
    address: string;
    profileImage: string;
    recentOrders: Order[];
    savedVendors: Vendor[];
    wishlist: Product[];
    notifications: { id: number; message: string; date: string; isRead: boolean }[];
  }>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    profileImage: "/images/avatars/default.jpg",
    recentOrders: [],
    savedVendors: [],
    wishlist: [],
    notifications: [],
  });

  // State for marketplace data
  const [marketplaceData, setMarketplaceData] = useState<{
    featuredProducts: Product[];
    popularCategories: Category[];
    flashSales: FlashSale[];
    recommendedShops: Vendor[];
    recentlyViewed: Product[];
  }>({
    featuredProducts: [],
    popularCategories: [],
    flashSales: [],
    recommendedShops: [],
    recentlyViewed: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if localStorage is available
        if (!window.localStorage) {
          setMessage("Local storage is disabled. Please enable it to continue.");
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/signin");
          return;
        }

        // Simulate API call with mock data
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Set user data
        setUserData({
          fullName: "John Doe",
          email: "john.doe@example.com",
          phone: "+254 712 345 678",
          address: "123 Kimathi Street, Nairobi CBD",
          profileImage: "/images/avatars/user1.jpg",
          recentOrders: [
            { id: "ORD-001", date: "2023-06-15", status: "Delivered", total: 3500, items: 2 },
            { id: "ORD-002", date: "2023-06-10", status: "Processing", total: 1200, items: 1 },
            { id: "ORD-003", date: "2023-06-05", status: "Delivered", total: 2800, items: 3 },
          ],
          savedVendors: [
            { id: 1, name: "Electronics Hub", category: "Electronics", image: "/images/shops/tech-hub.jpg", rating: 4.8, location: "Moi Avenue" },
            { id: 2, name: "Fashion World", category: "Fashion", image: "/images/shops/fashion-trends.jpg", rating: 4.6, location: "Kimathi Street" },
            { id: 3, name: "Fresh Groceries", category: "Grocery", image: "/images/shops/gourmet-delights.jpg", rating: 4.7, location: "Biashara Street" },
          ],
          wishlist: [
            { id: 101, name: "Wireless Headphones", price: 4999, discountPrice: 3999, image: "/images/products/headphones.jpg", category: "Electronics", vendor: "Electronics Hub", rating: 4.7 },
            { id: 102, name: "Summer Dress", price: 2999, image: "/images/products/womens-dress.jpg", category: "Fashion", vendor: "Fashion World", rating: 4.5 },
          ],
          notifications: [
            { id: 1, message: "Your order #ORD-001 has been delivered", date: "2023-06-15", isRead: false },
            { id: 2, message: "Flash sale on Electronics starting tomorrow!", date: "2023-06-14", isRead: true },
            { id: 3, message: "New shops added near your location", date: "2023-06-12", isRead: true },
          ],
        });
        
        // Set marketplace data
        setMarketplaceData({
          featuredProducts: [
            { id: 101, name: "Wireless Headphones", price: 4999, discountPrice: 3999, image: "/images/products/headphones.jpg", category: "Electronics", vendor: "Electronics Hub", rating: 4.7, isFeatured: true },
            { id: 102, name: "Summer Dress", price: 2999, image: "/images/products/womens-dress.jpg", category: "Fashion", vendor: "Fashion World", rating: 4.5, isFeatured: true },
            { id: 103, name: "Smartphone Pro", price: 89999, discountPrice: 79999, image: "/images/products/smartphone.jpg", category: "Electronics", vendor: "Electronics Hub", rating: 4.9, isFeatured: true, isNew: true },
            { id: 104, name: "Leather Handbag", price: 5999, image: "/images/products/handbag.jpg", category: "Fashion", vendor: "Fashion World", rating: 4.8, isFeatured: true },
          ],
          popularCategories: [
            { id: 1, name: "Electronics", icon: "electronics", count: 120 },
            { id: 2, name: "Fashion", icon: "fashion", count: 85 },
            { id: 3, name: "Home & Kitchen", icon: "home", count: 64 },
            { id: 4, name: "Beauty", icon: "beauty", count: 42 },
            { id: 5, name: "Sports", icon: "sports", count: 38 },
            { id: 6, name: "Books", icon: "books", count: 29 },
          ],
          flashSales: [
            { 
              id: 1, 
              product: { 
                id: 105, 
                name: "Smartwatch Series 5", 
                price: 34999, 
                discountPrice: 24999, 
                image: "/images/products/smartwatch.jpg", 
                category: "Electronics", 
                vendor: "Electronics Hub", 
                rating: 4.7,
                isFlashSale: true
              }, 
              discount: 30, 
              endsAt: "2023-06-20" 
            },
            { 
              id: 2, 
              product: { 
                id: 106, 
                name: "Men's Sneakers", 
                price: 4999, 
                discountPrice: 2999, 
                image: "/images/products/sneakers.jpg", 
                category: "Fashion", 
                vendor: "Fashion World", 
                rating: 4.6,
                isFlashSale: true
              }, 
              discount: 40, 
              endsAt: "2023-06-20" 
            },
          ],
          recommendedShops: [
            { id: 1, name: "Electronics Hub", category: "Electronics", image: "/images/shops/tech-hub.jpg", rating: 4.8, location: "Moi Avenue" },
            { id: 2, name: "Fashion World", category: "Fashion", image: "/images/shops/fashion-trends.jpg", rating: 4.6, location: "Kimathi Street" },
            { id: 3, name: "Home Essentials", category: "Home & Kitchen", image: "/images/shops/home-essentials.jpg", rating: 4.5, location: "Biashara Street" },
            { id: 4, name: "Beauty Spot", category: "Beauty", image: "/images/shops/beauty-spot.jpg", rating: 4.7, location: "Kenyatta Avenue" },
          ],
          recentlyViewed: [
            { id: 107, name: "Bluetooth Speaker", price: 12999, discountPrice: 9999, image: "/images/products/speaker.jpg", category: "Electronics", vendor: "Electronics Hub", rating: 4.6 },
            { id: 108, name: "Coffee Maker", price: 8999, image: "/images/products/coffee-maker.jpg", category: "Home & Kitchen", vendor: "Home Essentials", rating: 4.4 },
          ],
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage("Failed to load data. Please try again.");
        setIsLoading(false);
      }
    };

    // Handle verification message
    const verified = searchParams.get("verified");
    if (verified === "true" && searchParams.toString()) {
      setMessage("Email verified successfully!");
      router.replace("/dashboard", { scroll: false });
    } else {
      fetchData();
    }
  }, [router, searchParams]);

  // Function to render product card
  const renderProductCard = (product: Product) => (
    <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <div className="h-48 bg-gray-200">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={300}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
        
        {/* Badges */}
        <div className="absolute top-0 left-0 flex flex-col">
          {product.isNew && (
            <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 m-2 rounded">
              NEW
            </div>
          )}
          {product.isFlashSale && (
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 m-2 rounded flex items-center">
              <FaBolt className="mr-1" /> FLASH SALE
            </div>
          )}
        </div>
        
        {/* Wishlist Button */}
        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 bg-white rounded-full p-1.5 shadow-sm">
          <FaHeart size={18} />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
        
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400 mr-1">
            <FaStar className="fill-current" />
          </div>
          <span className="text-sm text-gray-600">{product.rating}</span>
          <span className="text-sm text-gray-500 ml-2">{product.vendor}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            {product.discountPrice ? (
              <div className="flex items-center">
                <span className="text-lg font-bold text-gray-900">KSh {product.discountPrice.toLocaleString()}</span>
                <span className="text-sm text-gray-500 line-through ml-2">KSh {product.price.toLocaleString()}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">KSh {product.price.toLocaleString()}</span>
            )}
          </div>
          <button className="text-orange-600 hover:text-orange-700 bg-orange-50 p-2 rounded-full">
            <FaShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  // Function to render shop card
  const renderShopCard = (shop: Vendor) => (
    <Link
      key={shop.id}
      href={`/shops/${shop.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
    >
      <div className="relative h-32">
        {shop.image ? (
          <Image
            src={shop.image}
            alt={shop.name}
            width={300}
            height={150}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        
        <div className="absolute bottom-2 left-2 bg-white rounded-full p-1 shadow-md">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <Image
              src={shop.image}
              alt={`${shop.name} logo`}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900">{shop.name}</h3>
        <p className="text-sm text-gray-500 mb-1">{shop.category}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-yellow-400">
            <FaStar className="fill-current mr-1" size={14} />
            <span className="text-sm text-gray-600">{shop.rating}</span>
          </div>
          
          <div className="flex items-center text-gray-500">
            <FaMapMarkerAlt size={14} className="mr-1" />
            <span className="text-sm">{shop.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <MainLayout>
      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {message && (
            <div className="mb-6 rounded-lg bg-green-100 p-4 border-l-4 border-green-500 text-green-700">
              <p>{message}</p>
            </div>
          )}

          {/* Dashboard Header */}
          <div className="mb-8 flex flex-col justify-between md:flex-row md:items-center">
            <div className="flex items-center">
              <div className="mr-4 w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                <Image 
                  src={userData.profileImage} 
                  alt={userData.fullName} 
                  width={48} 
                  height={48} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome back, {userData.fullName || "Guest"}</h1>
                <p className="text-gray-600">What would you like to explore today?</p>
              </div>
            </div>
            <div className="relative mt-4 md:mt-0">
              <div className="flex items-center overflow-hidden rounded-lg bg-white shadow-sm">
                <input
                  type="text"
                  placeholder="Search for vendors or products..."
                  className="w-64 py-2 px-4 focus:outline-none"
                />
                <button
                  type="button"
                  className="p-2 bg-orange-600 text-white"
                  aria-label="Search"
                >
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === "dashboard"
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === "products"
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab("shops")}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === "shops"
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Shops
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === "orders"
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                My Orders
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === "profile"
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                My Profile
              </button>
            </div>
          </div>

          {isLoading ? (
            <div
              className="flex h-64 items-center justify-center"
              role="status"
              aria-label="Loading"
            >
              <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <>
              {/* Dashboard Tab Content */}
              {activeTab === "dashboard" && (
                <div>
                  {/* Quick Links */}
                  <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <a
                      href="/shops"
                      className="flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg"
                    >
                      <div className="mb-4 rounded-full bg-orange-100 p-3 text-orange-500">
                        <FaStore className="text-xl" />
                      </div>
                      <h3 className="font-medium text-gray-800">Shops</h3>
                      <p className="mt-1 text-sm text-gray-500">Explore verified vendors</p>
                    </a>

                    <a
                      href="/orders"
                      className="flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg"
                    >
                      <div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-500">
                        <FaShoppingBag className="text-xl" />
                      </div>
                      <h3 className="font-medium text-gray-800">My Orders</h3>
                      <p className="mt-1 text-sm text-gray-500">Track your purchases</p>
                    </a>

                    <a
                      href="/favorites"
                      className="flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg"
                    >
                      <div className="mb-4 rounded-full bg-red-100 p-3 text-red-500">
                        <FaHeart className="text-xl" />
                      </div>
                      <h3 className="font-medium text-gray-800">Wishlist</h3>
                      <p className="mt-1 text-sm text-gray-500">Your saved items</p>
                    </a>

                    <a
                      href="/profile"
                      className="flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg"
                    >
                      <div className="mb-4 rounded-full bg-green-100 p-3 text-green-500">
                        <FaUser className="text-xl" />
                      </div>
                      <h3 className="font-medium text-gray-800">My Profile</h3>
                      <p className="mt-1 text-sm text-gray-500">Manage your account</p>
                    </a>
                  </div>

                  {/* Flash Sales */}
                  <div className="mb-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 p-6 shadow-md">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <FaBolt className="mr-2 text-white" size={20} />
                        <h2 className="text-lg font-semibold text-white">Flash Sales</h2>
                      </div>
                      <div className="flex items-center text-white">
                        <FaRegClock className="mr-1" />
                        <span className="text-sm">Ends in 2 days</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {marketplaceData.flashSales.map((sale) => (
                        <div key={sale.id} className="bg-white rounded-lg overflow-hidden flex">
                          <div className="w-1/3">
                            <Image
                              src={sale.product.image}
                              alt={sale.product.name}
                              width={100}
                              height={100}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="w-2/3 p-3">
                            <h3 className="font-medium text-gray-900 mb-1">{sale.product.name}</h3>
                            <div className="flex items-center mb-2">
                              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                                {sale.discount}% OFF
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-lg font-bold text-gray-900">KSh {sale.product.discountPrice?.toLocaleString()}</span>
                                <span className="text-sm text-gray-500 line-through ml-2">KSh {sale.product.price.toLocaleString()}</span>
                              </div>
                              <button className="text-white bg-orange-600 p-2 rounded-full hover:bg-orange-700">
                                <FaShoppingCart size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 text-center">
                      <a href="/flash-sales" className="inline-block bg-white text-orange-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
                        View All Flash Sales
                      </a>
                    </div>
                  </div>

                  {/* Popular Categories */}
                  <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-800">Popular Categories</h2>
                      <a
                        href="/categories"
                        className="text-sm font-medium text-orange-600 hover:text-orange-700"
                      >
                        View All
                      </a>
                    </div>
                    
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {marketplaceData.popularCategories.map((category) => (
                        <a
                          key={category.id}
                          href={`/categories/${category.id}`}
                          className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-12 h-12 mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-orange-500">{category.icon.charAt(0).toUpperCase()}</span>
                          </div>
                          <h3 className="text-sm font-medium text-gray-800">{category.name}</h3>
                          <p className="text-xs text-gray-500">{category.count} items</p>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Featured Products */}
                  <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-800">Featured Products</h2>
                      <a
                        href="/products"
                        className="text-sm font-medium text-orange-600 hover:text-orange-700"
                      >
                        View All
                      </a>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {marketplaceData.featuredProducts.map((product) => renderProductCard(product))}
                    </div>
                  </div>

                  {/* Recommended Shops */}
                  <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-800">Recommended Shops</h2>
                      <a
                        href="/shops"
                        className="text-sm font-medium text-orange-600 hover:text-orange-700"
                      >
                        View All
                      </a>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {marketplaceData.recommendedShops.map((shop) => renderShopCard(shop))}
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
                      <a
                        href="/orders"
                        className="text-sm font-medium text-orange-600 hover:text-orange-700"
                      >
                        View All
                      </a>
                    </div>
                    {userData.recentOrders.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                              >
                                Order ID
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                              >
                                Date
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                              >
                                Items
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                              >
                                Status
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                              >
                                Total
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                              >
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {userData.recentOrders.map((order) => (
                              <tr key={order.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                  {order.id}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                  {order.date}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                  {order.items}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                  <span
                                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                      order.status === "Delivered"
                                        ? "bg-green-100 text-green-800"
                                        : order.status === "Processing"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                  KES {order.total.toLocaleString()}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                  <a href={`/orders/${order.id}`} className="text-orange-600 hover:text-orange-700">
                                    View
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="py-4 text-center text-gray-500">
                        You haven&apos;t placed any orders yet.
                      </p>
                    )}
                  </div>

                  {/* Recently Viewed */}
                  <div className="rounded-lg bg-white p-6 shadow-md">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-800">Recently Viewed</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {marketplaceData.recentlyViewed.map((product) => renderProductCard(product))}
                    </div>
                  </div>
                </div>
              )}

              {/* Products Tab Content */}
              {activeTab === "products" && (
                <div>
                  {/* Categories Filter */}
                  <div className="mb-6 overflow-x-auto">
                    <div className="flex space-x-2 pb-2">
                      <button className="whitespace-nowrap px-4 py-2 bg-orange-600 text-white rounded-full">
                        All Products
                      </button>
                      {marketplaceData.popularCategories.map((category) => (
                        <button 
                          key={category.id}
                          className="whitespace-nowrap px-4 py-2 bg-white text-gray-700 rounded-full hover:bg-gray-100"
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Flash Sales */}
                  <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <FaBolt className="mr-2 text-orange-600" size={20} />
                        <h2 className="text-lg font-semibold text-gray-800">Flash Sales</h2>
                      </div>
                      <a
                        href="/flash-sales"
                        className="text-sm font-medium text-orange-600 hover:text-orange-700"
                      >
                        View All
                      </a>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {marketplaceData.flashSales.map((sale) => renderProductCard(sale.product))}
                    </div>
                  </div>

                  {/* All Products */}
                  <div className="rounded-lg bg-white p-6 shadow-md">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-800">All Products</h2>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">Sort by:</span>
                        <select className="text-sm border rounded-md p-1">
                          <option>Featured</option>
                          <option>Price: Low to High</option>
                          <option>Price: High to Low</option>
                          <option>Newest</option>
                          <option>Rating</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[...marketplaceData.featuredProducts, ...marketplaceData.flashSales.map(sale => sale.product), ...marketplaceData.recentlyViewed].map((product) => renderProductCard(product))}
                    </div>
                    
                    <div className="mt-6 flex justify-center">
                      <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                        Load More
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Shops Tab Content */}
              {activeTab === "shops" && (
                <div>
                  {/* Categories Filter */}
                  <div className="mb-6 overflow-x-auto">
                    <div className="flex space-x-2 pb-2">
                      <button className="whitespace-nowrap px-4 py-2 bg-orange-600 text-white rounded-full">
                        All Shops
                      </button>
                      {marketplaceData.popularCategories.map((category) => (
                        <button 
                          key={category.id}
                          className="whitespace-nowrap px-4 py-2 bg-white text-gray-700 rounded-full hover:bg-gray-100"
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Featured Shops */}
                  <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-800">Featured Shops</h2>
                      <a
                        href="/shops"
                        className="text-sm font-medium text-orange-600 hover:text-orange-700"
                      >
                        View All
                      </a>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {marketplaceData.recommendedShops.map((shop) => renderShopCard(shop))}
                    </div>
                  </div>

                  {/* Saved Shops */}
                  <div className="rounded-lg bg-white p-6 shadow-md">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-800">Saved Shops</h2>
                      <a
                        href="/favorites"
                        className="text-sm font-medium text-orange-600 hover:text-orange-700"
                      >
                        Manage
                      </a>
                    </div>
                    
                    {userData.savedVendors.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userData.savedVendors.map((shop) => renderShopCard(shop))}
                      </div>
                    ) : (
                      <p className="py-4 text-center text-gray-500">
                        You haven&apos;t saved any shops yet.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Orders Tab Content */}
              {activeTab === "orders" && (
                <div>
                  {/* Order Status Filter */}
                  <div className="mb-6 overflow-x-auto">
                    <div className="flex space-x-2 pb-2">
                      <button className="whitespace-nowrap px-4 py-2 bg-orange-600 text-white rounded-full">
                        All Orders
                      </button>
                      <button className="whitespace-nowrap px-4 py-2 bg-white text-gray-700 rounded-full hover:bg-gray-100">
                        Processing
                      </button>
                      <button className="whitespace-nowrap px-4 py-2 bg-white text-gray-700 rounded-full hover:bg-gray-100">
                        Shipped
                      </button>
                      <button className="whitespace-nowrap px-4 py-2 bg-white text-gray-700 rounded-full hover:bg-gray-100">
                        Delivered
                      </button>
                      <button className="whitespace-nowrap px-4 py-2 bg-white text-gray-700 rounded-full hover:bg-gray-100">
                        Cancelled
                      </button>
                    </div>
                  </div>

                  {/* Orders List */}
                  <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">My Orders</h2>
                    
                    {userData.recentOrders.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                              >
                                Order ID
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                              >
                                Date
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                              >
                                Items
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                              >
                                Status
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                              >
                                Total
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                              >
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {userData.recentOrders.map((order) => (
                              <tr key={order.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                  {order.id}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                  {order.date}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                  {order.items}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                  <span
                                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                      order.status === "Delivered"
                                        ? "bg-green-100 text-green-800"
                                        : order.status === "Processing"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                  KES {order.total.toLocaleString()}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                  <div className="flex space-x-2">
                                    <a href={`/orders/${order.id}`} className="text-blue-600 hover:text-blue-800">
                                      View
                                    </a>
                                    <a href={`/track-order?id=${order.id}`} className="text-orange-600 hover:text-orange-800">
                                      Track
                                    </a>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="py-4 text-center text-gray-500">
                        You haven&apos;t placed any orders yet.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Profile Tab Content */}
              {activeTab === "profile" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Profile Information */}
                  <div className="md:col-span-2">
                    <div className="rounded-lg bg-white p-6 shadow-md mb-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h2>
                      
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 mb-4 md:mb-0 flex justify-center">
                          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                            <Image 
                              src={userData.profileImage} 
                              alt={userData.fullName} 
                              width={128} 
                              height={128} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        
                        <div className="md:w-2/3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                              <p className="text-gray-900">{userData.fullName}</p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                              <p className="text-gray-900">{userData.email}</p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                              <p className="text-gray-900">{userData.phone}</p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                              <p className="text-gray-900">{userData.address}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                              Edit Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Wishlist */}
                    <div className="rounded-lg bg-white p-6 shadow-md mb-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">My Wishlist</h2>
                        <a
                          href="/wishlist"
                          className="text-sm font-medium text-orange-600 hover:text-orange-700"
                        >
                          View All
                        </a>
                      </div>
                      
                      {userData.wishlist.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {userData.wishlist.map((product) => (
                            <div key={product.id} className="flex bg-gray-50 rounded-lg overflow-hidden">
                              <div className="w-1/3">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={100}
                                  height={100}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="w-2/3 p-3">
                                <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                                <div className="flex items-center mb-2">
                                  <div className="flex text-yellow-400 mr-1">
                                    <FaStar className="fill-current" size={14} />
                                  </div>
                                  <span className="text-sm text-gray-600">{product.rating}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div>
                                    {product.discountPrice ? (
                                      <div className="flex items-center">
                                        <span className="text-sm font-bold text-gray-900">KSh {product.discountPrice.toLocaleString()}</span>
                                        <span className="text-xs text-gray-500 line-through ml-1">KSh {product.price.toLocaleString()}</span>
                                      </div>
                                    ) : (
                                      <span className="text-sm font-bold text-gray-900">KSh {product.price.toLocaleString()}</span>
                                    )}
                                  </div>
                                  <button className="text-orange-600 hover:text-orange-700 bg-orange-50 p-1 rounded-full">
                                    <FaShoppingCart size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="py-4 text-center text-gray-500">
                          Your wishlist is empty.
                        </p>
                      )}
                    </div>
                    
                    {/* Recent Orders */}
                    <div className="rounded-lg bg-white p-6 shadow-md">
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
                        <a
                          href="/orders"
                          className="text-sm font-medium text-orange-600 hover:text-orange-700"
                        >
                          View All
                        </a>
                      </div>
                      
                      {userData.recentOrders.length > 0 ? (
                        <div className="space-y-4">
                          {userData.recentOrders.map((order) => (
                            <div key={order.id} className="flex justify-between items-center border-b pb-4 last:border-0">
                              <div>
                                <p className="font-medium text-gray-900">{order.id}</p>
                                <p className="text-sm text-gray-500">{order.date}</p>
                              </div>
                              <div>
                                <span
                                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                    order.status === "Delivered"
                                      ? "bg-green-100 text-green-800"
                                      : order.status === "Processing"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">KES {order.total.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">{order.items} items</p>
                              </div>
                              <a href={`/orders/${order.id}`} className="text-orange-600 hover:text-orange-700">
                                <FaChevronRight />
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="py-4 text-center text-gray-500">
                          You haven&apos;t placed any orders yet.
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Sidebar */}
                  <div className="md:col-span-1">
                    {/* Account Menu */}
                    <div className="rounded-lg bg-white p-6 shadow-md mb-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Account</h2>
                      
                      <nav className="space-y-1">
                        <a href="/profile" className="flex items-center px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-md">
                          <FaUser className="mr-3 text-orange-500" />
                          <span>Profile Information</span>
                        </a>
                        <a href="/orders" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                          <FaShoppingBag className="mr-3 text-gray-400" />
                          <span>Orders</span>
                        </a>
                        <a href="/wishlist" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                          <FaHeart className="mr-3 text-gray-400" />
                          <span>Wishlist</span>
                        </a>
                        <a href="/addresses" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                          <FaMapMarkerAlt className="mr-3 text-gray-400" />
                          <span>Addresses</span>
                        </a>
                        <a href="/payment-methods" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                          <FaCreditCard className="mr-3 text-gray-400" />
                          <span>Payment Methods</span>
                        </a>
                        <a href="/notifications" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                          <FaBell className="mr-3 text-gray-400" />
                          <span>Notifications</span>
                        </a>
                      </nav>
                    </div>
                    
                    {/* Notifications */}
                    <div className="rounded-lg bg-white p-6 shadow-md">
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
                        <a
                          href="/notifications"
                          className="text-sm font-medium text-orange-600 hover:text-orange-700"
                        >
                          View All
                        </a>
                      </div>
                      
                      {userData.notifications.length > 0 ? (
                        <div className="space-y-4">
                          {userData.notifications.map((notification) => (
                            <div key={notification.id} className={`p-3 rounded-md ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50'}`}>
                              <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="py-4 text-center text-gray-500">
                          No notifications.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}