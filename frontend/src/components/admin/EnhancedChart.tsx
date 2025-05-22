"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { FiDownload, FiCalendar, FiRefreshCw } from 'react-icons/fi';
import { useTheme } from '@/context/ThemeContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type ChartType = 'bar' | 'line' | 'doughnut';

interface EnhancedChartProps {
  title: string;
  type: ChartType;
  data: ChartData<any>;
  options?: ChartOptions<any>;
  height?: string;
  timeRanges?: string[];
  onTimeRangeChange?: (range: string) => void;
  onRefresh?: () => void;
  onDownload?: (format: 'png' | 'jpg' | 'pdf') => void;
}

export default function EnhancedChart({
  title,
  type,
  data,
  options = {},
  height = '300px',
  timeRanges = ['7d', '30d', '90d', '1y', 'all'],
  onTimeRangeChange,
  onRefresh,
  onDownload
}: EnhancedChartProps) {
  const { theme } = useTheme();
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  
  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    if (onTimeRangeChange) {
      onTimeRangeChange(range);
    }
  };
  
  const handleDownload = (format: 'png' | 'jpg' | 'pdf') => {
    if (onDownload) {
      onDownload(format);
    }
    setIsDownloadMenuOpen(false);
  };
  
  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case '1y': return 'Last year';
      case 'all': return 'All time';
      default: return range;
    }
  };
  
  const defaultOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          },
          color: theme === 'dark' ? '#e5e7eb' : '#374151',
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.9)' : 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        cornerRadius: 6,
        displayColors: true,
        titleColor: theme === 'dark' ? '#e5e7eb' : '#ffffff',
        bodyColor: theme === 'dark' ? '#d1d5db' : '#ffffff',
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    scales: type === 'bar' || type === 'line' ? {
      x: {
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
        }
      },
      y: {
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
        }
      }
    } : undefined
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data} options={mergedOptions} />;
      case 'line':
        return <Line data={data} options={mergedOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={mergedOptions} />;
      default:
        return <Bar data={data} options={mergedOptions} />;
    }
  };
  
  return (
    <motion.div 
      className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } rounded-lg shadow-md overflow-hidden transition-colors duration-200`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={`p-4 border-b ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <div className="flex justify-between items-center">
          <h3 className={`text-lg font-medium ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{title}</h3>
          
          <div className="flex items-center space-x-2">
            {onTimeRangeChange && (
              <div className="relative">
                <div className={`flex items-center space-x-1 text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  <FiCalendar className="w-4 h-4" />
                  <select 
                    value={selectedTimeRange}
                    onChange={(e) => handleTimeRangeChange(e.target.value)}
                    className={`appearance-none bg-transparent border-none focus:outline-none pr-8 py-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                    style={{ 
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${
                        theme === 'dark' ? '%239ca3af' : '%236b7280'
                      }' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.25rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                    }}
                  >
                    {timeRanges.map(range => (
                      <option key={range} value={range} className={
                        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                      }>
                        {getTimeRangeLabel(range)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            {onRefresh && (
              <motion.button 
                onClick={onRefresh}
                className={`p-1.5 rounded-full ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                } transition-colors`}
                title="Refresh data"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiRefreshCw className="w-4 h-4" />
              </motion.button>
            )}
            
            {onDownload && (
              <div className="relative">
                <motion.button 
                  onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
                  className={`p-1.5 rounded-full ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  } transition-colors`}
                  title="Download chart"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiDownload className="w-4 h-4" />
                </motion.button>
                
                {isDownloadMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-36 rounded-md shadow-lg z-10 py-1 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                  }`}>
                    <button 
                      onClick={() => handleDownload('png')}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        theme === 'dark' 
                          ? 'text-gray-300 hover:bg-gray-600' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Download PNG
                    </button>
                    <button 
                      onClick={() => handleDownload('jpg')}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        theme === 'dark' 
                          ? 'text-gray-300 hover:bg-gray-600' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Download JPG
                    </button>
                    <button 
                      onClick={() => handleDownload('pdf')}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        theme === 'dark' 
                          ? 'text-gray-300 hover:bg-gray-600' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Download PDF
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800' : ''}`} style={{ height }}>
        {renderChart()}
      </div>
    </motion.div>
  );
}