import React from 'react';
import { MessageSquare } from 'lucide-react';

const ReviewsManagement: React.FC = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
          <p className="mt-2 text-sm text-gray-700">Manage customer reviews and ratings</p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Reviews Management</h3>
        <p className="text-gray-600">This feature will allow you to manage customer reviews and ratings.</p>
      </div>
    </div>
  );
};

export default ReviewsManagement;
