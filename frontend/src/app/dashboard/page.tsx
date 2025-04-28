// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// import Cookies from "js-cookie";

export default function Dashboard() {
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "true") {
      setMessage("Email verified successfully!");
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  return (
    <div className="dashboard">
      <h1>Welcome to Nairobi verified</h1>
      {message && <p className="text-green-500">{message}</p>}
      {/* Existing dashboard content */}
    </div>
  );
}