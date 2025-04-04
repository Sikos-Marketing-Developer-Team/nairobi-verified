"use client";

import Image from "next/image";

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
        <div className="text-lg font-bold">My Application</div>
        <ul className="flex space-x-4">
            <li> <a href="/">   <Image 
        src="/images/logo.png" 
        alt="Logo" 
        width={70} 
        height={70} 
        className="mt-5" 
      /></a></li>
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/about" className="hover:underline">About</a></li>
            <li><a href="/contact" className="hover:underline">Contact</a></li>
        </ul>
        </nav>
    );
}