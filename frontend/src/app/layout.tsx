import './globals.css';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProviderWrapper } from "../components/ThemeProviderWrapper";
import { ThemeToggle } from "../components/ThemeToggle"; // Import the ThemeToggle
import FooterWrapper from "../components/FooterWrapper";
// (feat: Implement admin user creation utility and enhance application routes and UI)

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Nairobi Verified",
  description: "A trusted e-commerce platform that helps users discover and shop from verified vendors in Nairobi CBD",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <ThemeProviderWrapper>
          <div className="flex flex-col min-h-screen">
            <div className="fixed bottom-4 right-4 z-50">
              <ThemeToggle />
            </div>
            <main className="flex-grow">
              {children}
            </main>
            {/* FooterWrapper will conditionally render the footer only for non-admin pages */}
            <FooterWrapper />
          </div>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
