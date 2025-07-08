import React from 'react';
import { Zap } from 'lucide-react';

const FlashSalesManagement: React.FC = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flash Sales Management</h1>
          <p className="mt-2 text-sm text-gray-700">Manage flash sales and promotions</p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8 text-center">
        <Zap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Flash Sales Management</h3>
        <p className="text-gray-600">This feature will allow you to create and manage flash sales.</p>
      </div>
    </div>
  );
};

export default FlashSalesManagement;
