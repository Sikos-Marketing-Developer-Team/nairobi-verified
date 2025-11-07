import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async'; 
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
import MerchantDashboard from "./pages/merchant/MerchantDashboard";
import MerchantProfileEdit from "./pages/merchant/MerchantProfileEdit";
import MerchantVerification from "./pages/merchant/MerchantVerification";
import ChangePassword from "./pages/merchant/ChangePassword";
import ProductManagement from "./pages/merchant/ProductManagement";
import ReviewManagement from "./pages/merchant/ReviewManagement";
import PhotoGallery from "./pages/merchant/PhotoGallery";
import ServicesManagement from "./pages/merchant/ServicesManagement";
import CustomerEngagement from "./pages/merchant/CustomerEngagement";
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
import FlashSaleDetail from "./pages/FlashSaleDetail";
import { FavoritesProvider } from './contexts/FavoritesContext';
import MerchantAuth from './pages/MerchantAuth';
import MerchantRedirect from './components/MerchantRedirect';
import AllProducts from './pages/AllProducts';

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
  <HelmetProvider>
      <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
        <BrowserRouter>
        <AuthProvider>
           <FavoritesProvider>
          <CartProvider>
            <Routes>
               {/* Add Helmet to your homepage route */}
                    <Route path="/" element={
                      <>
                        <Helmet>
                          <script type="application/ld+json">
                           {JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Nairobi Verified",
  "url": "https://www.nairobiverified.co.ke/",
  "logo": "https://www.nairobiverified.co.ke/logo.png",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.nairobiverified.co.ke/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
})}
                          </script>
                        </Helmet>
                         <Index />
                      </>
                    } />
              
              <Route path="/merchants" element={<Merchants />} />
              <Route path="/business/:id" element={<MerchantDetail />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/register" element={<UserRegister />} />
              <Route path="/auth/register/merchant" element={<MerchantRegister />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/merchant/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
              <Route path="/merchant/account-setup/:token" element={<MerchantAccountSetup />} />
              <Route path="/howitworks" element={<HowItWorks />} />
              
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
              
              {/* Merchant Routes */}
              <Route path="/merchant/change-password" element={
                <ProtectedRoute requireMerchant={true}>
                  <ChangePassword />
                </ProtectedRoute>
              } />
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
              <Route path="/merchant/products" element={
                <ProtectedRoute requireMerchant={true}>
                  <ProductManagement />
                </ProtectedRoute>
              } />
              <Route path="/merchant/reviews" element={
                <ProtectedRoute requireMerchant={true}>
                  <ReviewManagement />
                </ProtectedRoute>
              } />
              <Route path="/merchant/gallery" element={
                <ProtectedRoute requireMerchant={true}>
                  <PhotoGallery />
                </ProtectedRoute>
              } />
              <Route path="/merchant/services" element={
                <ProtectedRoute requireMerchant={true}>
                  <ServicesManagement />
                </ProtectedRoute>
              } />
              <Route path="/merchant/engagement" element={
                <ProtectedRoute requireMerchant={true}>
                  <CustomerEngagement />
                </ProtectedRoute>
              } />
              
              <Route path="/about" element={<About />} />
              <Route path="/auth/social-callback" element={<Auth />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:categoryId" element={<Categories />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/merchant/:id" element={<MerchantRedirect />} />
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
              <Route path="/merchant/sign-in" element={<MerchantAuth />} />
              <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
              <Route path="/all-products" element={<AllProducts />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Cookie Consent Banner */}
            <CookieConsent />
          </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </BrowserRouter>
      </GoogleOAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
