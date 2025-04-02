"use client";

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { FiHome, FiShoppingBag, FiUsers, FiSettings, FiSearch, FiBell, FiSun, FiMoon, FiChevronDown, FiMapPin, FiTag, FiPhone, FiMail } from 'react-icons/fi';
import Link from 'next/link';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const categories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Fashion' },
  { id: 3, name: 'Home & Living' },
  { id: 4, name: 'Health & Beauty' },
  { id: 5, name: 'Sports & Outdoors' }
];

const deals = [
  {
    id: 1,
    title: 'Summer Sale',
    description: 'Get up to 50% off on selected items',
    shop: 'Electronics Hub'
  },
  {
    id: 2,
    title: 'Flash Deal',
    description: 'Limited time offer - 24 hours only',
    shop: 'Fashion Store'
  },
  {
    id: 3,
    title: 'Weekend Special',
    description: 'Buy one get one free on all accessories',
    shop: 'Gadget World'
  }
];

const shops = [
  {
    id: 1,
    name: 'Electronics Hub',
    category: 'Electronics',
    address: 'Westlands, Nairobi',
    phone: '+254 712 345 678',
    email: 'contact@electronicshub.com',
    coordinates: { lat: -1.2921, lng: 36.8219 }
  },
  {
    id: 2,
    name: 'Fashion Store',
    category: 'Fashion',
    address: 'Kilimani, Nairobi',
    phone: '+254 723 456 789',
    email: 'info@fashionstore.com',
    coordinates: { lat: -1.2873, lng: 36.7822 }
  },
  {
    id: 3,
    name: 'Gadget World',
    category: 'Electronics',
    address: 'Karen, Nairobi',
    phone: '+254 734 567 890',
    email: 'support@gadgetworld.com',
    coordinates: { lat: -1.3182, lng: 36.7172 }
  }
];

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: -1.2921,
  lng: 36.8219
};

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const menuItems = [
    { icon: FiHome, label: 'Dashboard', href: '/dashboard', active: true },
    { icon: FiShoppingBag, label: 'Products', href: '/products' },
    { icon: FiUsers, label: 'Customers', href: '/customers' },
    { icon: FiSettings, label: 'Settings', href: '/settings' },
  ];

  const stats = [
    { title: 'Total Sales', value: '$12,426', increase: '+16%' },
    { title: 'Total Orders', value: '436', increase: '+8%' },
    { title: 'Active Users', value: '1,257', increase: '+12%' },
    { title: 'Conversion Rate', value: '3.2%', increase: '+4%' },
  ];

  const filteredShops = shops.filter(shop => {
    const matchesCategory = selectedCategory ? shop.category === selectedCategory : true;
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shop.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="dashboard-layout">
        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-logo">
            <span>Nairobi Verified</span>
          </div>
          <nav className="sidebar-menu">
            {menuItems.map((item, index) => (
              <Link 
                key={index} 
                href={item.href}
                className={`menu-item ${item.active ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Top Bar */}
          <div className="top-bar">
            <div className="search-bar">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search shops, categories, or deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              />
            </div>

            <div className="user-menu">
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
              
              <div className="notification-badge">
                <FiBell size={20} />
                <span className="notification-count">3</span>
              </div>

              <div className="user-profile">
                <div className="user-avatar">JD</div>
                <div className="hidden md:block">
                  <div className="font-semibold">John Doe</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Admin</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6">
            <h1 className="text-xl md:text-2xl font-bold mb-6">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="dashboard-grid">
              {stats.map((stat, index) => (
                <div key={index} className="dashboard-card">
                  <div className="card-header">
                    <h3 className="card-title">{stat.title}</h3>
                    <div className="text-green-500 text-sm">{stat.increase}</div>
                  </div>
                  <div className="card-content">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">Last 30 days</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Categories Dropdown */}
            <div className="category-dropdown my-8">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="dropdown-button bg-white dark:bg-gray-800"
              >
                <span>{selectedCategory || 'All Categories'}</span>
                <FiChevronDown className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu bg-white dark:bg-gray-800">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.name);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-orange-100 dark:hover:bg-gray-700"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Deals Section */}
            <section className="mb-12">
              <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center">
                <FiTag className="mr-2 text-orange-500" />
                Featured Deals
              </h2>
              <div className="deals-grid">
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="dashboard-card"
                  >
                    <h3 className="text-lg font-semibold mb-2">{deal.title}</h3>
                    <p className="mb-4 text-gray-600 dark:text-gray-300">{deal.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">at {deal.shop}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Shops Section */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center">
                <FiShoppingBag className="mr-2 text-orange-500" />
                Available Shops
              </h2>
              <div className="shops-grid">
                {/* Shops List */}
                <div className="space-y-4">
                  {filteredShops.map((shop) => (
                    <div
                      key={shop.id}
                      className="dashboard-card"
                    >
                      <h3 className="text-lg font-semibold mb-2">{shop.name}</h3>
                      <p className="mb-2 text-gray-600 dark:text-gray-300">{shop.category}</p>
                      <div className="space-y-2">
                        <p className="flex items-center text-sm">
                          <FiMapPin className="mr-2" /> {shop.address}
                        </p>
                        <p className="flex items-center text-sm">
                          <FiPhone className="mr-2" /> {shop.phone}
                        </p>
                        <p className="flex items-center text-sm">
                          <FiMail className="mr-2" /> {shop.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Google Maps */}
                <div className="map-container">
                  <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={center}
                      zoom={12}
                      options={{
                        styles: theme === 'dark' ? [
                          { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                          { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] }
                        ] : []
                      }}
                    >
                      {filteredShops.map((shop) => (
                        <Marker
                          key={shop.id}
                          position={shop.coordinates}
                          title={shop.name}
                        />
                      ))}
                    </GoogleMap>
                  </LoadScript>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}