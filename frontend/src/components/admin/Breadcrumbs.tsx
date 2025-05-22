"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaChevronRight, FaHome } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';

interface BreadcrumbsProps {
  homeLabel?: string;
  homeHref?: string;
  items?: { label: string; href?: string }[];
}

export default function Breadcrumbs({ 
  homeLabel = 'Dashboard', 
  homeHref = '/admin/dashboard',
  items = []
}: BreadcrumbsProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  
  // If no items are provided, generate them from the pathname
  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbItems(pathname);
  
  return (
    <nav className="mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 text-sm">
        <li>
          <Link 
            href={homeHref}
            className={`flex items-center ${
              theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaHome className="mr-1" />
            <span>{homeLabel}</span>
          </Link>
        </li>
        
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            <FaChevronRight className={`mx-1 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`} />
            
            {item.href && index < breadcrumbItems.length - 1 ? (
              <Link 
                href={item.href}
                className={`${
                  theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <span className={`${
                theme === 'dark' ? 'text-gray-100 font-medium' : 'text-gray-900 font-medium'
              }`}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Helper function to generate breadcrumb items from pathname
function generateBreadcrumbItems(pathname: string) {
  // Remove leading slash and split by slashes
  const paths = pathname.substring(1).split('/');
  
  // Skip the first segment (admin) as it's already covered by the home link
  const segments = paths.slice(1);
  
  return segments.map((segment, index) => {
    // Format the label (capitalize first letter, replace hyphens with spaces)
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Generate href for all but the last item
    const href = index < segments.length - 1 
      ? `/${paths.slice(0, index + 2).join('/')}`
      : undefined;
    
    return { label, href };
  });
}