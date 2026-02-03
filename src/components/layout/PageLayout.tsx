import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  className = "" 
}) => {
  const baseClasses = "min-h-screen bg-white dark:bg-gray-900 p-2 sm:p-4 md:p-6";
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;
  
  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
};