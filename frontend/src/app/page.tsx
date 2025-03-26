"use client";

import Link from "next/link";

export default function Home() {
 

  return (
    <div className="wrapper h-screen flex flex-col items-center justify-center text-center">
    <h1 className="text-2xl font-bold mb-4">Hey Guys, Use this page for Navigating to Auth Pages</h1>
    <h2 className="text-lg mb-6">The Route to access the login page is http://localhost:3000/auth/signin</h2>
  
    {/* Button Container */}
    <div className="flex items-center justify-center">
      <Link href="/auth/signin">
        <button className="btn p-3 px-6 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition">
          Login Page
        </button>
      </Link>
    </div>


  {/* Deleted Code */}

  {/* Sign Up and Login Navigation */}


  </div>
  
  );
}
