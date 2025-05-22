"use client";

import { useState, useEffect } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  title?: string;
  subtitle?: string;
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  actions?: React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (item: T) => void;
}

export default function DataTable<T>({
  data,
  columns,
  keyField,
  title,
  subtitle,
  searchable = true,
  pagination = true,
  pageSize = 10,
  actions,
  emptyMessage = "No data available",
  loading = false,
  onRowClick
}: DataTableProps<T>) {
  const { theme } = useTheme();
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<T[]>(data);
  
  // Update filtered data when data, search term, or sort changes
  useEffect(() => {
    let result = [...data];
    
    // Apply search filter if searchable
    if (searchable && searchTerm) {
      result = result.filter(item => 
        Object.values(item as Record<string, unknown>).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply sorting if a sort field is selected
    if (sortField) {
      result.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue === bValue) return 0;
        
        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    
    setFilteredData(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [data, searchTerm, sortField, sortDirection, searchable]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = pagination 
    ? filteredData.slice(startIndex, startIndex + pageSize) 
    : filteredData;
  
  // Handle sort click
  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Get sort icon for column
  const getSortIcon = (field: keyof T) => {
    if (sortField !== field) return <FaSort className="ml-1 text-gray-400" />;
    return sortDirection === 'asc' 
      ? <FaSortUp className="ml-1 text-blue-500" /> 
      : <FaSortDown className="ml-1 text-blue-500" />;
  };
  
  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden transition-colors duration-200`}>
      {/* Header */}
      {(title || searchable) && (
        <div className={`px-6 py-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-b`}>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            {/* Title */}
            {title && (
              <div>
                <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {title}
                </h3>
                {subtitle && (
                  <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            
            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {searchable && (
                <div className={`relative rounded-md shadow-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                  </div>
                  <input
                    type="text"
                    className={`block w-full pl-10 pr-3 py-2 rounded-md focus:outline-none focus:ring-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' 
                        : 'border-gray-300 focus:ring-blue-500 text-gray-900'
                    }`}
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}
              
              {actions && (
                <div className="flex space-x-2">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                {columns.map((column, index) => (
                  <th 
                    key={index} 
                    className={`px-6 py-3 text-left text-xs font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider ${column.sortable ? 'cursor-pointer' : ''}`}
                    onClick={() => column.sortable && typeof column.accessor === 'string' && handleSort(column.accessor)}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {column.sortable && typeof column.accessor === 'string' && getSortIcon(column.accessor)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`${theme === 'dark' ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}`}>
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <motion.tr 
                    key={String(item[keyField])}
                    className={`${
                      onRowClick ? 'cursor-pointer hover:bg-opacity-80' : ''
                    } ${
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onRowClick && onRowClick(item)}
                    whileHover={{ scale: onRowClick ? 1.01 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {columns.map((column, index) => (
                      <td 
                        key={index} 
                        className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}
                      >
                        {column.cell 
                          ? column.cell(item)
                          : typeof column.accessor === 'function'
                            ? column.accessor(item)
                            : String(item[column.accessor] || '')
                        }
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan={columns.length} 
                    className={`px-6 py-12 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className={`px-6 py-3 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border-t flex items-center justify-between`}>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} entries
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? theme === 'dark' ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : theme === 'dark' ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FaChevronLeft className="h-4 w-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    : theme === 'dark' ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? theme === 'dark' ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : theme === 'dark' ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FaChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}