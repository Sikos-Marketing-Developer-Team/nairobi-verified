'use client';

import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface DynamicImportProps {
  component: React.LazyExoticComponent<any>;
  fallback?: React.ReactNode;
}

/**
 * DynamicImport component for code splitting and lazy loading components
 * 
 * @param component - LazyExoticComponent to load
 * @param fallback - Fallback UI to show while loading
 */
const DynamicImport: React.FC<DynamicImportProps> = ({ 
  component: Component, 
  fallback = <LoadingSpinner /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
};

export default DynamicImport;