import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import CookieConsent from "./components/CookieConsent";
import Index from "./pages/Index";
import Merchants from "./pages/Merchants";
import MerchantDetail from "./pages/MerchantDetail";
import MerchantRegister from "./pages/MerchantRegister";
import UserRegister from "./pages/UserRegister";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import UserProfile from "./pages/UserProfile";
import Favorites from "./pages/Favorites";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVerifications from "./pages/AdminVerifications";
import AdminMerchants from "./pages/AdminMerchants";
import AdminAddMerchant from "./pages/AdminAddMerchant";
import AdminUsers from "./pages/AdminUsers";
import AdminSettings from "./pages/AdminSettings";
import MerchantDashboard from "./pages/MerchantDashboard";
import MerchantProfileEdit from "./pages/MerchantProfileEdit";
import MerchantVerification from "./pages/MerchantVerification";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Categories from "./pages/Categories";
import HowItWorks from "./pages/HowItWorks";
import SafetyGuidelines from "./pages/SafetyGuidelines";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import Support from "./pages/Support";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import MerchantAccountSetup from "./pages/MerchantAccountSetup";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Contact from "./pages/Contact";
import Status from "./pages/Status";
import AdminFlashSales from "./pages/AdminFlashSales";
import AdminCreateFlashSale from "./pages/AdminCreateFlashSale";
import AdminEditFlashSale from "./pages/AdminEditFlashSale";
import FlashSaleDetail from "./pages/FlashSaleDetail";

const queryClient = new QueryClient();

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | null;
  requireMerchant?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = null, 
  requireMerchant = false 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />;
  }
  
  if (requireMerchant && !(user?.isMerchant || user?.businessName)) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
        <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/merchants" element={<Merchants />} />
              <Route path="/merchant/:id" element={<MerchantDetail />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/register" element={<UserRegister />} />
              <Route path="/auth/register/merchant" element={<MerchantRegister />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
              <Route path="/merchant/account-setup/:token" element={<MerchantAccountSetup />} />
              
              {/* Protected User Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } />
              <Route path="/favorites" element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/verifications" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminVerifications />
                </ProtectedRoute>
              } />
              <Route path="/admin/merchants" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminMerchants />
                </ProtectedRoute>
              } />
              <Route path="/admin/merchants/add" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminAddMerchant />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminSettings />
                </ProtectedRoute>
              } />
              <Route path="/admin/flash-sales" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminFlashSales />
                </ProtectedRoute>
              } />
              <Route path="/admin/flash-sales/create" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminCreateFlashSale />
                </ProtectedRoute>
              } />
              <Route path="/admin/flash-sales/edit/:id" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminEditFlashSale />
                </ProtectedRoute>
              } />
              
              {/* Merchant Routes */}
              <Route path="/merchant/dashboard" element={
                <ProtectedRoute requireMerchant={true}>
                  <MerchantDashboard />
                </ProtectedRoute>
              } />
              <Route path="/merchant/profile/edit" element={
                <ProtectedRoute requireMerchant={true}>
                  <MerchantProfileEdit />
                </ProtectedRoute>
              } />
              <Route path="/merchant/verification" element={
                <ProtectedRoute requireMerchant={true}>
                  <MerchantVerification />
                </ProtectedRoute>
              } />
              
              <Route path="/about" element={<About />} />
              <Route path="/auth/social-callback" element={<Auth />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:categoryId" element={<Categories />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/flash-sale/:id" element={<FlashSaleDetail />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/safety-guidelines" element={<SafetyGuidelines />} />
              <Route path="/merchant/subscription-plans" element={<SubscriptionPlans />} />
              <Route path="/support" element={<Support />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/status" element={<Status />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Cookie Consent Banner */}
            <CookieConsent />
          </CartProvider>
        </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
