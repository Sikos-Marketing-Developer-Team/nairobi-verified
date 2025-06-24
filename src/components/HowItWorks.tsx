
import React from 'react';
import { FileText, CheckCircle, MapPin, ShoppingBag } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: FileText,
      title: "Merchants Register",
      description: "Business owners submit their registration with verification documents and physical location details."
    },
    {
      icon: CheckCircle,
      title: "Admin Verification",
      description: "Our admin team reviews documents and verifies the physical location of each business."
    },
    {
      icon: MapPin,
      title: "Verified Badge",
      description: "Approved merchants receive a verification badge and appear in our trusted directory."
    },
    {
      icon: ShoppingBag,
      title: "Shop with Confidence",
      description: "Customers can find and visit verified businesses with complete confidence in their legitimacy."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our verification process ensures every merchant on the platform is a legitimate business with a physical location you can visit.
          </p>
        </div>

  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
  {steps.map((step, index) => (
    <div
      key={index}
      className="text-center bg-white rounded-xl border border-[#FEEFD4]  p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-300 relative group hover:-translate-y-2"
    >
      {/* Number badge with glow */}
      <div className="absolute -top-3 -right-3 z-10">
        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md ring-2 ring-yellow-200">
          {index + 1}
        </div>
      </div>

      {/* Step icon */}
      <div className="mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
          <step.icon className="h-8 w-8 text-primary" />
        </div>
      </div>

      {/* Title and description */}
      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
        {step.title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {step.description}
      </p>

      {/* Hover underline */}
      <div className="w-0 h-1 bg-orange-500 group-hover:w-full transition-all duration-300 mt-4"></div>

      {/* Right arrow */}
      {index !== steps.length - 1 && (
        <div className="hidden md:block absolute top-1/2 -right-4 w-6 h-6 transform -translate-y-1/2 text-orange-200">
          <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
            <path d="M5 12h14m-7-7l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  ))}
</div>





      </div>
    </section>
  );
};

export default HowItWorks;
