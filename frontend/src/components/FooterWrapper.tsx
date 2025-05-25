"use client";

import { usePathname } from 'next/navigation';
import Footer from "./Footer";

export default function FooterWrapper() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const isHomePage = pathname === '/';
  
  // Don't render the footer on admin pages or home page
  // (home page already has a footer from MainLayout)
  if (isAdminPage || isHomePage) {
    return null;
  }
  
  return <Footer />;
}