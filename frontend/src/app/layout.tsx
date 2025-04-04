import './globals.css';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProviderWrapper } from "../components/ThemeProviderWrapper"; // Adjust the path as needed


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Nairobi Verified",
  description: "A verified platform for Nairobi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <ThemeProviderWrapper>
          {children}
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}