"use client";
import Image from "next/image";
import Navbar from "@/components/Navbar";


export default function Home() {
  return (
    <div className="home">
      <Navbar />
      <div className="min-h-screen w-full overflow-x-hidden">
  <div className="max-w-4xl mx-auto p-8">
    <h1 className="text-2xl font-bold mb-4">Welcome to Nairobi Verified 👋</h1>
    <p className="text-gray-700">Start building your amazing content here...</p>
  </div>
</div>

   
     
    </div>
   
  )
}