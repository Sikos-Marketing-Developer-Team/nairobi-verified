import { Skeleton } from "./skeleton";

// Card skeleton for product/merchant cards
export const CardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-48 w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-6 w-1/4" />
    </div>
  </div>
);

// Product grid skeleton
export const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

// Merchant grid skeleton
export const MerchantGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="space-y-3">
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Dashboard skeleton
export const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    
    {/* Stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3 p-6 border rounded-lg">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
    
    {/* Main content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

// Profile skeleton
export const ProfileSkeleton = () => (
  <div className="space-y-6">
    {/* Profile header */}
    <div className="flex items-center space-x-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
    
    {/* Profile form */}
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-24 w-full" />
      </div>
      
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

// Table skeleton
export const TableSkeleton = () => (
  <div className="space-y-4">
    {/* Table header */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-1/4" />
      <Skeleton className="h-10 w-32" />
    </div>
    
    {/* Table */}
    <div className="border rounded-lg">
      {/* Header row */}
      <div className="flex items-center p-4 border-b">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 mx-2" />
        ))}
      </div>
      
      {/* Data rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center p-4 border-b last:border-b-0">
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="flex-1 mx-2">
              {j === 0 ? (
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <Skeleton className="h-4 w-20" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Product detail skeleton
export const ProductDetailSkeleton = () => (
  <div className="space-y-6">
    {/* Breadcrumb */}
    <div className="flex items-center space-x-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-24" />
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product images */}
      <div className="space-y-4">
        <Skeleton className="h-96 w-full rounded-lg" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded" />
          ))}
        </div>
      </div>
      
      {/* Product info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        
        <Skeleton className="h-8 w-1/3" />
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-20" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  </div>
);

// Users Management skeleton
export const UsersManagementSkeleton = () => (
  <div className="space-y-6 animate-fadeIn">
    {/* Header section - matches exact structure */}
    <div className="sm:flex sm:items-center sm:justify-between">
      <div>
        <Skeleton className="h-8 w-48 bg-gray-200" />
        <Skeleton className="h-4 w-64 mt-2 bg-gray-100" />
      </div>
      <div className="mt-4 sm:mt-0">
        <div className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm">
          <Skeleton className="h-4 w-4 mr-2 bg-gray-200" />
          <Skeleton className="h-4 w-16 bg-gray-200" />
        </div>
      </div>
    </div>

    {/* Users List - matches exact structure */}
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="px-6 py-4" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <Skeleton className="h-6 w-6 bg-gray-400" />
                  </div>
                </div>
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-32 bg-gray-200" />
                  <Skeleton className="h-3 w-48 bg-gray-100" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full">
                  <Skeleton className="h-4 w-16 bg-gray-200 rounded-full" />
                </div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full">
                  <Skeleton className="h-4 w-14 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

// Merchants Management skeleton
export const MerchantsManagementSkeleton = () => (
  <div className="space-y-6 animate-fadeIn">
    {/* Header section */}
    <div className="sm:flex sm:items-center sm:justify-between">
      <div>
        <Skeleton className="h-8 w-52 bg-gray-200" />
        <Skeleton className="h-4 w-72 mt-2 bg-gray-100" />
      </div>
      <div className="mt-4 sm:mt-0 flex space-x-3">
        <Skeleton className="h-10 w-32 bg-gray-200" />
        <Skeleton className="h-10 w-24 bg-gray-200" />
      </div>
    </div>

    {/* Search and Filter section */}
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1 bg-gray-100" />
        <Skeleton className="h-10 w-32 bg-gray-100" />
      </div>
    </div>

    {/* Stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Skeleton className="h-8 w-8 bg-gray-200" />
            <div className="ml-4 flex-1">
              <Skeleton className="h-4 w-16 bg-gray-100" />
              <Skeleton className="h-6 w-12 mt-1 bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Merchants List */}
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i} className="px-6 py-4" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="flex-shrink-0">
                  <Skeleton className="h-12 w-12 rounded-full bg-gray-200" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40 bg-gray-200" />
                      <Skeleton className="h-3 w-32 bg-gray-100" />
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-3 w-24 bg-gray-100" />
                        <Skeleton className="h-3 w-28 bg-gray-100" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-6 w-16 rounded-full bg-gray-200" />
                      <Skeleton className="h-8 w-8 bg-gray-200" />
                      <Skeleton className="h-8 w-8 bg-gray-200" />
                      <Skeleton className="h-8 w-8 bg-gray-200" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

// Page skeleton wrapper
export const PageSkeleton = ({ children }: { children: React.ReactNode }) => (
  <div className="container mx-auto px-4 py-8">
    {children}
  </div>
);

// Hero section skeleton
export const HeroSkeleton = () => (
  <div className="relative h-96 bg-gradient-to-br from-orange-50 to-yellow-50">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-2xl mx-auto px-4">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-2/3 mx-auto" />
        <div className="flex items-center justify-center space-x-4 mt-8">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    </div>
  </div>
);

// Category section skeleton
export const CategorySkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-1/4" />
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="text-center space-y-2">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);