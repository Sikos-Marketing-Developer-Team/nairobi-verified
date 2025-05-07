"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/MainLayout";
import { FiSearch, FiChevronDown, FiMapPin, FiPhone, FiMail, FiTag, FiShoppingBag } from "react-icons/fi";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const categories = [
  { id: 1, name: "Electronics", icon: "🔌" },
  { id: 2, name: "Fashion", icon: "👕" },
  { id: 3, name: "Home & Living", icon: "🏠" },
  { id: 4, name: "Health & Beauty", icon: "💄" },
  { id: 5, name: "Sports & Outdoors", icon: "⚽" },
  { id: 6, name: "Books & Media", icon: "📚" },
  { id: 7, name: "Toys & Games", icon: "🎮" },
  { id: 8, name: "Automotive", icon: "🚗" },
];

const deals = [
  {
    id: 1,
    title: "Flash Sale - Electronics",
    description: "Up to 50% off on selected electronics",
    shop: "Electronics Hub",
    validUntil: "2024-03-20",
    discount: "50%",
    image: "/images/deals/electronics.jpg",
  },
  {
    id: 2,
    title: "Fashion Week Special",
    description: "Buy 2 Get 1 Free on all clothing items",
    shop: "Fashion Store",
    validUntil: "2024-03-25",
    discount: "33%",
    image: "/images/deals/fashion.jpg",
  },
  {
    id: 3,
    title: "Gadget Bonanza",
    description: "Special discounts on latest gadgets",
    shop: "Gadget World",
    validUntil: "2024-03-22",
    discount: "40%",
    image: "/images/deals/gadgets.jpg",
  },
];

const shops = [
  {
    id: 1,
    name: "Electronics Hub",
    category: "Electronics",
    rating: 4.5,
    reviews: 128,
    address: "Westlands, Nairobi",
    phone: "+254 712 345 678",
    email: "contact@electronicshub.com",
    coordinates: { lat: -1.2921, lng: 36.8219 },
    image: "/images/shops/electronics-hub.jpg",
  },
  {
    id: 2,
    name: "Fashion Store",
    category: "Fashion",
    rating: 4.3,
    reviews: 96,
    address: "Kilimani, Nairobi",
    phone: "+254 723 456 789",
    email: "info@fashionstore.com",
    coordinates: { lat: -1.2873, lng: 36.7822 },
    image: "/images/shops/fashion-store.jpg",
  },
  {
    id: 3,
    name: "Gadget World",
    category: "Electronics",
    rating: 4.7,
    reviews: 156,
    address: "Karen, Nairobi",
    phone: "+254 734 567 890",
    email: "support@gadgetworld.com",
    coordinates: { lat: -1.3182, lng: 36.7172 },
    image: "/images/shops/gadget-world.jpg",
  },
];

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: -1.2921,
  lng: 36.8219,
};

export default function UserDashboard() {
  const { isAuthenticated, isLoading } = useAuth("client");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Redirect handled by useAuth
  }

  const filteredShops = shops.filter((shop) => {
    const matchesCategory = selectedCategory ? shop.category === selectedCategory : true;
    const matchesSearch =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Search and Categories Section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-xl w-full">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for shops or products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="relative w-full md:w-64">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <span className="flex items-center">
                    {selectedCategory ? categories.find((c) => c.name === selectedCategory)?.icon : "📂"}
                    <span className="ml-2">{selectedCategory || "All Categories"}</span>
                  </span>
                  <FiChevronDown className={`transform transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.name);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-orange-100 dark:hover:bg-gray-600 flex items-center"
                      >
                        <span className="mr-2">{category.icon}</span>
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Deals Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FiTag className="mr-2 text-orange-500" />
              Hot Deals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                    {/* Replace with actual images */}
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                      {deal.discount} OFF
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{deal.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{deal.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">at {deal.shop}</span>
                      <span className="text-orange-500">Valid until {deal.validUntil}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Shops and Map Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shops List */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FiShoppingBag className="mr-2 text-orange-500" />
                Verified Shops
              </h2>
              <div className="space-y-4">
                {filteredShops.map((shop) => (
                  <div
                    key={shop.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{shop.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{shop.category}</p>
                        <div className="space-y-2 text-sm">
                          <p className="flex items-center text-gray-500 dark:text-gray-400">
                            <FiMapPin className="mr-2" /> {shop.address}
                          </p>
                          <p className="flex items-center text-gray-500 dark:text-gray-400">
                            <FiPhone className="mr-2" /> {shop.phone}
                          </p>
                          <p className="flex items-center text-gray-500 dark:text-gray-400">
                            <FiMail className="mr-2" /> {shop.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end mb-1">
                          <span className="text-yellow-400">★</span>
                          <span className="ml-1 font-semibold">{shop.rating}</span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                            ({shop.reviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Google Maps */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FiMapPin className="mr-2 text-orange-500" />
                Shop Locations
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={12}
                    options={{
                      styles: [
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                      ],
                    }}
                  >
                    {filteredShops.map((shop) => (
                      <Marker key={shop.id} position={shop.coordinates} title={shop.name} />
                    ))}
                  </GoogleMap>
                </LoadScript>
              </div>
            </div>
          </section>
        </main>
      </div>
    </MainLayout>
  );
}