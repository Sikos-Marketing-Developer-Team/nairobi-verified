
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
