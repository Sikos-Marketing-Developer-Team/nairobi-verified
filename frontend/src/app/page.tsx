"use client";
import Image from "next/image";
import Navbar from "@/components/Navbar";


export default function Home() {
  return (
    <div className="home mt-150px">
      <Navbar />
      <section className="hero bg-orange-200 text-white py-12">
  <div className="container mx-auto text-center">
    <h1 className="text-4xl font-bold mb-4">Welcome to Nairobi Verified</h1>
    <p className="text-lg mb-6">A trusted platform for buyers and vendors to connect, shop, and sell.</p>
    <div className="flex justify-center space-x-6">
      <a href="/auth/register/client" className="bg-black text-white py-2 px-6 rounded-full hover:bg-[#EC5C0B]">Sign Up as Buyer</a>
      <a href="/auth/register/merchant" className="bg-white text-black py-2 px-6 rounded-full hover:bg-[#EC5C0B]">Sign Up as Vendor</a>
    </div>
  </div>
</section>

<section className="features py-16 bg-gray-100">
  <div className="container mx-auto text-center">
    <h2 className="text-3xl font-bold mb-6">Our Features</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="feature-card p-6 bg-white rounded-md shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Register as a Vendor</h3>
        <p className="mb-4">Easily sign up as a vendor and start selling your products on Nairobi Verified.</p>
        <a href="/auth/register/merchant" className="text-[#EC5C0B] hover:underline">Learn More</a>
      </div>
      <div className="feature-card p-6 bg-white rounded-md shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Browse Products</h3>
        <p className="mb-4">Explore a wide range of products from different categories available for purchase.</p>
        <a href="/categories" className="text-[#EC5C0B] hover:underline">Browse Now</a>
      </div>
      <div className="feature-card p-6 bg-white rounded-md shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Manage Your Profile</h3>
        <p className="mb-4">Vendors can manage their profile, update product listings, and more on their dashboard.</p>
        <a href="/vendor/profile" className="text-[#EC5C0B] hover:underline">Go to Dashboard</a>
      </div>
    </div>
  </div>
</section>

<section className="cta bg-gray-700 text-white py-12 text-center">
  <div className="container mx-auto">
    <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
    <p className="text-lg mb-6">Whether you're a buyer or a vendor, Nairobi Verified is the right place for you!</p>
    <a href="/join" className="bg-black text-white py-3 px-8 rounded-full hover:bg-[#EC5C0B]">Join Now</a>
  </div>
</section>

   
     
    </div>
   
  )
}