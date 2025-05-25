'use client';

import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

interface DynamicImportProps {
  importFunc: () => Promise<any>;
  fallback?: React.ReactNode;
  ssr?: boolean;
  loading?: React.ComponentType<any>;
  props?: Record<string, any>;
}

/**
 * DynamicImport component for code splitting and lazy loading components
 * 
 * @param importFunc - Function that returns a dynamic import
 * @param fallback - Fallback UI to show while loading
 * @param ssr - Whether to render on the server
 * @param loading - Loading component to show while loading
 * @param props - Props to pass to the dynamically loaded component
 */
const DynamicImport: React.FC<DynamicImportProps> = ({
  importFunc,
  fallback = <div className="animate-pulse bg-gray-200 rounded-md w-full h-40"></div>,
  ssr = false,
  loading: Loading,
  props = {}
}) => {
  const DynamicComponent = dynamic(importFunc, {
    loading: Loading,
    ssr
  });

  return (
    <Suspense fallback={fallback}>
      <DynamicComponent {...props} />
    </Suspense>
  );
};

export default DynamicImport;