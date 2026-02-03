import React from 'react';
import FilterSidebar from '@/components/filter/FilterSidebar';

interface ProductListLayoutProps {
  children: React.ReactNode;
  pageType?: string;
}

export const ProductListLayout: React.FC<ProductListLayoutProps> = ({ 
  children, 
}) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex">
          {/* Filter Sidebar - Fixed/Sticky */}
          <div className="hidden lg:block flex-shrink-0">
            <div className="sticky top-0 h-screen overflow-y-auto">
              <FilterSidebar />
            </div>
          </div>
          
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};