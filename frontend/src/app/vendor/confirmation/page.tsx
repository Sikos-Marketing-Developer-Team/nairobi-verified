"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "../../../components/MainLayout";
import { FaCheckCircle, FaHome } from "react-icons/fa";
import { Suspense } from "react";

function VendorConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    if (searchParams) {
      const name = searchParams.get("businessName");
      if (name) {
        setBusinessName(decodeURIComponent(name));
      }
    }
  }, [searchParams]);

  return (
    <MainLayout>
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <FaCheckCircle className="text-green-500 text-5xl" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Thank You!</h1>
              <div className="text-lg text-gray-700 space-y-4">
                <p className="font-medium">
                  <span className="text-primary-600">{businessName || "Your Business"}</span> for showing interest and taking the initiative of registering with us.
                </p>
                <p>
                  Your business is now under review. Once your documents and business are confirmed for legitimacy, you will receive an email from us with the next steps.
                </p>
                <p className="font-medium">
                  Thank you for choosing Nairobi Verified.
                </p>
              </div>
              <div className="mt-10">
                <button
                  onClick={() => router.push("/")}
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  <FaHome className="mr-2" />
                  Return to Homepage
                </button>
              </div>
              <div className="mt-8 text-sm text-gray-500">
                <p>
                  If you have any questions, please contact our support team at{" "}
                  <a href="mailto:support@nairobiverifed.com" className="text-primary-600 hover:underline">
                    support@nairobiverifed.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function VendorConfirmation() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="bg-gray-100 py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-lg text-gray-500">Loading confirmation...</p>
              </div>
            </div>
          </div>
        </MainLayout>
      }
    >
      <VendorConfirmationContent />
    </Suspense>
  );
}
