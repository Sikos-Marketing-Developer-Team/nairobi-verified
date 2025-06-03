import React, { useState, useEffect } from 'react';
import { FiStar, FiX } from 'react-icons/fi';
import { apiService } from '../lib/api';
import { Category } from '../types/api';

interface FilterSidebarProps {
  onPriceRangeChange: (range: [number, number]) => void;
  onCategoryChange: (categoryId: string, checked: boolean) => void;
  onRatingChange: (rating: number, checked: boolean) => void;
  onClearAll: () => void;
  selectedCategories: string[];
  selectedRatings: number[];
  priceRange: [number, number];
  isMobile?: boolean;
  onClose?: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  onPriceRangeChange,
  onCategoryChange,
  onRatingChange,
  onClearAll,
  selectedCategories,
  selectedRatings,
  priceRange,
  isMobile = false,
  onClose,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>(priceRange);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.categories.getAll();
        setCategories(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Update temp price range when prop changes
  useEffect(() => {
    setTempPriceRange(priceRange);
  }, [priceRange]);

  const handlePriceRangeApply = () => {
    onPriceRangeChange(tempPriceRange);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      {isMobile && (
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX size={20} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className={`${isMobile ? 'hidden' : 'block'} text-lg font-semibold text-gray-900 dark:text-white`}>
          Filters
        </h2>
        <button
          onClick={onClearAll}
          className="text-sm text-orange-500 hover:text-orange-600"
        >
          Clear All
        </button>
      </div>
      
      {/* Price Range Filter */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
          Price Range
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="number"
            value={tempPriceRange[0]}
            onChange={(e) => setTempPriceRange([parseInt(e.target.value) || 0, tempPriceRange[1]])}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Min"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            value={tempPriceRange[1]}
            onChange={(e) => setTempPriceRange([tempPriceRange[0], parseInt(e.target.value) || 0])}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Max"
          />
        </div>
        <button
          onClick={handlePriceRangeApply}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded-md text-sm"
        >
          Apply
        </button>
      </div>
      
      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
          Categories
        </h3>
        {loading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onChange={(e) => onCategoryChange(category.id, e.target.checked)}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                />
                <label
                  htmlFor={`category-${category.id}`}
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Rating Filter */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
          Rating
        </h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center">
              <input
                type="checkbox"
                id={`rating-${rating}`}
                checked={selectedRatings.includes(rating)}
                onChange={(e) => onRatingChange(rating, e.target.checked)}
                className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
              />
              <label
                htmlFor={`rating-${rating}`}
                className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    className={`${
                      i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-1">{rating === 1 ? '& Up' : ''}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;