import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'UI Style Guide | Nairobi Verified',
  description: 'Design system and UI components for Nairobi Verified platform',
};

export default function UIGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              UI Style Guide
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              Design system and component library for Nairobi Verified
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Color Palette */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex flex-col">
              <div className="h-24 bg-blue-600 rounded-t-lg"></div>
              <div className="bg-white p-4 rounded-b-lg shadow">
                <p className="font-medium">Primary</p>
                <p className="text-sm text-gray-500">#3B82F6</p>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="h-24 bg-green-500 rounded-t-lg"></div>
              <div className="bg-white p-4 rounded-b-lg shadow">
                <p className="font-medium">Secondary</p>
                <p className="text-sm text-gray-500">#10B981</p>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="h-24 bg-amber-500 rounded-t-lg"></div>
              <div className="bg-white p-4 rounded-b-lg shadow">
                <p className="font-medium">Accent</p>
                <p className="text-sm text-gray-500">#F59E0B</p>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="h-24 bg-gray-800 rounded-t-lg"></div>
              <div className="bg-white p-4 rounded-b-lg shadow">
                <p className="font-medium">Neutral</p>
                <p className="text-sm text-gray-500">#1F2937</p>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="h-24 bg-gray-50 rounded-t-lg border border-gray-200"></div>
              <div className="bg-white p-4 rounded-b-lg shadow">
                <p className="font-medium">Background</p>
                <p className="text-sm text-gray-500">#F9FAFB</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Typography */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Typography</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h1 className="text-5xl font-bold mb-2">Heading 1</h1>
              <p className="text-gray-500">Font: Inter Bold, 48px</p>
            </div>
            <div className="mb-6">
              <h2 className="text-4xl font-bold mb-2">Heading 2</h2>
              <p className="text-gray-500">Font: Inter Bold, 36px</p>
            </div>
            <div className="mb-6">
              <h3 className="text-3xl font-bold mb-2">Heading 3</h3>
              <p className="text-gray-500">Font: Inter Bold, 30px</p>
            </div>
            <div className="mb-6">
              <h4 className="text-2xl font-bold mb-2">Heading 4</h4>
              <p className="text-gray-500">Font: Inter Bold, 24px</p>
            </div>
            <div className="mb-6">
              <h5 className="text-xl font-bold mb-2">Heading 5</h5>
              <p className="text-gray-500">Font: Inter Bold, 20px</p>
            </div>
            <div className="mb-6">
              <h6 className="text-lg font-bold mb-2">Heading 6</h6>
              <p className="text-gray-500">Font: Inter Bold, 18px</p>
            </div>
            <div className="mb-6">
              <p className="text-base mb-2">Body Text (Regular)</p>
              <p className="text-gray-500">Font: Inter Regular, 16px</p>
            </div>
            <div>
              <p className="text-sm mb-2">Small Text</p>
              <p className="text-gray-500">Font: Inter Regular, 14px</p>
            </div>
          </div>
        </section>
        
        {/* Buttons */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Buttons</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out">
                  Primary Button
                </button>
                <p className="text-sm text-gray-500 mt-2">Primary action</p>
              </div>
              <div>
                <button className="w-full bg-white hover:bg-gray-50 text-blue-600 font-medium py-2 px-4 rounded-md border border-blue-600 transition duration-150 ease-in-out">
                  Secondary Button
                </button>
                <p className="text-sm text-gray-500 mt-2">Secondary action</p>
              </div>
              <div>
                <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out">
                  Success Button
                </button>
                <p className="text-sm text-gray-500 mt-2">Confirmation action</p>
              </div>
              <div>
                <button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out">
                  Danger Button
                </button>
                <p className="text-sm text-gray-500 mt-2">Destructive action</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-150 ease-in-out">
                  Large Button
                </button>
                <p className="text-sm text-gray-500 mt-2">py-3 px-4</p>
              </div>
              <div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out">
                  Medium Button
                </button>
                <p className="text-sm text-gray-500 mt-2">py-2 px-4</p>
              </div>
              <div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 text-sm rounded-md transition duration-150 ease-in-out">
                  Small Button
                </button>
                <p className="text-sm text-gray-500 mt-2">py-1 px-3 text-sm</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Form Elements */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Form Elements</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="example-input" className="block text-sm font-medium text-gray-700 mb-1">
                  Text Input
                </label>
                <input
                  type="text"
                  id="example-input"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter text here"
                />
              </div>
              
              <div>
                <label htmlFor="example-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Input
                </label>
                <select
                  id="example-select"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="example-textarea" className="block text-sm font-medium text-gray-700 mb-1">
                  Textarea
                </label>
                <textarea
                  id="example-textarea"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter longer text here"
                ></textarea>
              </div>
              
              <div>
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-1">Checkbox Group</legend>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="checkbox-1"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="checkbox-1" className="ml-2 text-sm text-gray-700">
                        Option 1
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="checkbox-2"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="checkbox-2" className="ml-2 text-sm text-gray-700">
                        Option 2
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
        </section>
        
        {/* Cards */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 bg-gray-200 relative">
                {/* Placeholder for product image */}
                <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                  SALE
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-1">Product Name</h3>
                <p className="text-gray-500 text-sm mb-2">Category</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-900">KSh 1,999</span>
                    <span className="text-sm text-gray-500 line-through ml-2">KSh 2,499</span>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Info Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-blue-600 px-4 py-3">
                <h3 className="text-lg font-medium text-white">Information Card</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 mb-4">This is an information card that can be used to display important content to users.</p>
                <button className="text-blue-600 font-medium hover:text-blue-800 transition-colors duration-150 ease-in-out">
                  Learn More →
                </button>
              </div>
            </div>
            
            {/* User Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-300 mr-4"></div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">User Name</h3>
                    <p className="text-gray-500 text-sm">Merchant</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">User information and details can be displayed in this card format.</p>
                <div className="flex justify-between">
                  <button className="text-blue-600 font-medium hover:text-blue-800 transition-colors duration-150 ease-in-out">
                    View Profile
                  </button>
                  <button className="text-gray-600 font-medium hover:text-gray-800 transition-colors duration-150 ease-in-out">
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Alerts */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Alerts & Notifications</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Information alert: This is an informational message.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Success alert: Your action was completed successfully.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Warning alert: Please be aware of this important notice.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Error alert: There was a problem with your action.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Navigation Components */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Navigation Components</h2>
          <div className="space-y-8">
            {/* Breadcrumbs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Breadcrumbs</h3>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                  <li className="inline-flex items-center">
                    <a href="#" className="text-gray-700 hover:text-blue-600">
                      Home
                    </a>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                      </svg>
                      <a href="#" className="text-gray-700 hover:text-blue-600 ml-1 md:ml-2">
                        Products
                      </a>
                    </div>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                      </svg>
                      <span className="text-gray-500 ml-1 md:ml-2">
                        Product Details
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
            
            {/* Pagination */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Pagination</h3>
              <nav className="flex justify-center">
                <ul className="inline-flex -space-x-px">
                  <li>
                    <a href="#" className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700">
                      Previous
                    </a>
                  </li>
                  <li>
                    <a href="#" className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700">
                      1
                    </a>
                  </li>
                  <li>
                    <a href="#" className="px-3 py-2 leading-tight text-blue-600 bg-blue-50 border border-gray-300 hover:bg-blue-100 hover:text-blue-700">
                      2
                    </a>
                  </li>
                  <li>
                    <a href="#" className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700">
                      3
                    </a>
                  </li>
                  <li>
                    <a href="#" className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700">
                      Next
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
            
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tabs</h3>
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <a href="#" className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                    Dashboard
                  </a>
                  <a href="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                    Products
                  </a>
                  <a href="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                    Orders
                  </a>
                  <a href="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                    Settings
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-blue-600 rounded-lg shadow-lg p-6 md:p-10 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to implement these UI components?</h2>
          <p className="text-xl mb-6">Check out our complete routes list and start building consistent interfaces.</p>
          <Link href="/sitemap" className="inline-block bg-white text-blue-600 font-bold py-3 px-6 rounded-md hover:bg-gray-100 transition duration-150 ease-in-out">
            View Site Map
          </Link>
        </div>
      </div>
    </div>
  );
}