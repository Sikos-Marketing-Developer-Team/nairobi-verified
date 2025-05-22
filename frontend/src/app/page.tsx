"use client";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="home">
      <Navbar />

      <div className="home-body mt-0">
        {/* Hero Section */}
       <section className="mt-[80px] md:mt-[150px] bg-orange-100 text-gray-900 py-12 px-4 sm:px-6">
 <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-[var(--text-color)]">
              Welcome to Nairobi Verified
            </h1>
            <p className="text-base sm:text-lg mb-6 text-[#EC5C0B]">
              A trusted platform that helps you discover and shop from verified vendors in Nairobi CBD — complete with directions to each shop!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <a href="/auth/register/client" className="bg-black text-white py-2 px-6 rounded-full hover:bg-[#EC5C0B] transition">
                Sign Up as Buyer
              </a>
              <a href="/auth/register/merchant" className="bg-white text-black py-2 px-6 rounded-full hover:bg-[#EC5C0B] transition">
                Sign Up as Vendor
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features py-16 px-4 bg-gray-100">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-[var(--text-color)]">Our Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="feature-card p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2 text-[var(--text-color)]">Register as a Vendor</h3>
                <p className="mb-4 text-[var(--text-color)]">Easily sign up and start selling your products on Nairobi Verified.</p>
                <a href="/auth/register/merchant" className="text-[#EC5C0B] hover:underline">Create Account</a>
              </div>
              <div className="feature-card p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2 text-[var(--text-color)]">Browse Products</h3>
                <p className="mb-4 text-[var(--text-color)]">Explore a wide range of categories available for purchase.</p>
                <a href="/categories" className="text-[#EC5C0B] hover:underline">Browse Now</a>
              </div>
              <div className="feature-card p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2 text-[var(--text-color)]">Manage Your Profile</h3>
                <p className="mb-4 text-[var(--text-color)]">Vendors can manage their shop, update listings, and more.</p>
                <a href="/vendor/profile" className="text-[#EC5C0B] hover:underline">Go to Dashboard</a>
              </div>
            </div>
          </div>
        </section>

        {/* City Navigation Section */}
        <section className="navigation-help py-16 px-4 bg-[#F8F8F8]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#EC5C0B] mb-4">Explore Nairobi CBD with Ease</h2>
            <p className="mb-6 text-gray-700">
              Nairobi Verified doesn’t just help you shop — it helps you get there too. Find vendor locations and navigate the busy CBD like a pro!
            </p>
            <a href="/map" className="bg-[#EC5C0B] text-white py-2 px-8 rounded-full hover:bg-[#C94A06] transition">
              View Shop Locations
            </a>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="cta bg-[#EC5C0B] text-white py-12 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-base sm:text-lg mb-6">
              Whether you're a buyer or a vendor, Nairobi Verified is the right place for you!
            </p>
            <a href="/join" className="bg-black text-white py-3 px-8 rounded-full hover:bg-white hover:text-black transition">
              Join Now
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

