import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UsersManagement from './pages/UsersManagement';
import MerchantsManagement from './pages/MerchantsManagement';
import ProductsManagement from './pages/ProductsManagement';
import ReviewsManagement from './pages/ReviewsManagement';
import FlashSalesManagement from './pages/FlashSalesManagement';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import AdminLayout from './components/layout/AdminLayout';
import PageTransition from './components/common/PageTransition';

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 animate-fadeIn">
        <div className="flex flex-col items-center gap-4 animate-slideInUp">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-medium">Loading admin panel...</p>
            <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// App routes component
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <AdminLayout>
            <Routes>
              <Route path="/dashboard" element={
                <PageTransition>
                  <AdminDashboard />
                </PageTransition>
              } />
              <Route path="/users" element={
                <PageTransition>
                  <UsersManagement />
                </PageTransition>
              } />
              <Route path="/merchants" element={
                <PageTransition>
                  <MerchantsManagement />
                </PageTransition>
              } />
              <Route path="/products" element={
                <PageTransition>
                  <ProductsManagement />
                </PageTransition>
              } />
              <Route path="/reviews" element={
                <PageTransition>
                  <ReviewsManagement />
                </PageTransition>
              } />
              <Route path="/flash-sales" element={
                <PageTransition>
                  <FlashSalesManagement />
                </PageTransition>
              } />
              <Route path="/analytics" element={
                <PageTransition>
                  <AnalyticsPage />
                </PageTransition>
              } />
              <Route path="/settings" element={
                <PageTransition>
                  <SettingsPage />
                </PageTransition>
              } />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
              },
            }}
          />
        </div>
      </BrowserRouter>
    </AdminAuthProvider>
  );
};

export default App;
