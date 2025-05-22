"use client";

import { usePathname } from 'next/navigation';
import Footer from "./Footer";

export default function FooterWrapper() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  
  // Don't render the footer on admin pages
  if (isAdminPage) {
    return null;
  }
  
  return <Footer />;
}