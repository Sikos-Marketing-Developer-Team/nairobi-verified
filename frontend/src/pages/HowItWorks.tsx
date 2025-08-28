import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FileText, CheckCircle, MapPin, ShoppingBag, Users, Shield, Building, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PageSkeleton } from '@/components/ui/loading-skeletons';
import { usePageLoading } from '@/hooks/use-loading';
import { Skeleton } from '@/components/ui/skeleton';

const HowItWorks = () => {
  const isLoading = usePageLoading(600);
  const [activeStep, setActiveStep] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);
  
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

  const benefits = [
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Every merchant is physically verified, reducing the risk of fraud and ensuring you're dealing with legitimate businesses."
    },
    {
      icon: Building,
      title: "Local Economy",
      description: "Support local businesses in Nairobi's CBD that have been vetted and verified by our team."
    },
    {
      icon: MapPin,
      title: "Physical Locations",
      description: "All merchants have real physical stores you can visit, providing peace of mind for your shopping."
    },
    {
      icon: Users,
      title: "Community Reviews",
      description: "Read authentic reviews from other customers who have visited and purchased from these merchants."
    },
    {
      icon: Star,
      title: "Quality Assurance",
      description: "Our verification process includes quality checks to ensure merchants meet our standards."
    },
    {
      icon: ShoppingBag,
      title: "Diverse Selection",
      description: "Browse a wide range of products across multiple categories from verified merchants."
    }
  ];

  const faqs = [
    {
      question: "How do you verify merchants?",
      answer: "Our verification process includes document review, physical location visits, and business legitimacy checks. We ensure each merchant has a real physical location in Nairobi's CBD."
    },
    {
      question: "Can I visit these merchants in person?",
      answer: "Yes! All merchants on our platform have physical locations that you can visit. Their addresses are verified and listed on their profile pages."
    },
    {
      question: "What if I have an issue with a purchase?",
      answer: "We have a customer support team ready to assist with any issues. Additionally, since all merchants have physical locations, you can visit them directly to resolve concerns."
    },
    {
      question: "How do I become a verified merchant?",
      answer: "Business owners can register through our 'Register Your Business' option. You'll need to provide business documentation and address details for verification."
    },
    {
      question: "Are online payments secure?",
      answer: "Yes, we use industry-standard encryption and secure payment gateways to ensure all transactions are protected."
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        
        {/* Hero Section Skeleton */}
        <section className="py-12 bg-gradient-to-br from-orange-50 to-yellow-50 ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-5 w-full mb-3" />
            <Skeleton className="h-5 w-5/6 mx-auto mb-6" />
            <Skeleton className="h-10 w-48 mx-auto" />
          </div>
        </section>

        <PageSkeleton>
          <div className="space-y-12">
            {/* Steps Section Skeleton */}
            <div className="space-y-10">
              <div className="text-center space-y-3">
                <Skeleton className="h-8 w-1/3 mx-auto" />
                <Skeleton className="h-5 w-2/3 mx-auto" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="text-center space-y-3">
                    <Skeleton className="h-14 w-14 rounded-full mx-auto" />
                    <Skeleton className="h-5 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6 mx-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits Section Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-5">
                <div className="space-y-3">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-5/6" />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-3 p-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section Skeleton */}
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <Skeleton className="h-8 w-1/3 mx-auto" />
                <Skeleton className="h-5 w-2/3 mx-auto" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PageSkeleton>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 pt-40 bg-gradient-to-br from-orange-50 to-yellow-50 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold inter text-gray-900 mb-3 md:mb-4">
            How Nairobi Verified Works
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto mb-4 md:mb-6 text-left md:text-center">
            Our platform connects shoppers with physically verified merchants in Nairobi's CBD, 
            ensuring trust and confidence in every transaction.
          </p>
          <div className="flex flex-row justify-center gap-2 md:gap-3 flex-wrap">
            <Link to="/merchants" className="flex-1 min-w-[120px] max-w-[180px]">
              <Button size="sm" className="w-full bg-primary hover:bg-primary-dark text-white text-xs md:text-sm py-1 h-8">
                Find Merchants
              </Button>
            </Link>
            <Link to="/auth/register/merchant" className="flex-1 min-w-[120px] max-w-[180px]">
              <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary hover:text-white text-xs md:text-sm py-1 h-8">
                Register Business
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Process Steps */}
      <section className="py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold inter text-gray-900 mb-2 md:mb-3">
              Our Verification Process
            </h2>
            <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto text-left md:text-center">
              We follow a rigorous process to ensure every merchant on our platform is legitimate and trustworthy.
            </p>
          </div>
          
          {/* Mobile Steps (List style with icons on right) */}
          <div className="md:hidden">
            <ul className="space-y-3">
              {steps.map((step, index) => (
                <li key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <button 
                    className="w-full p-3 flex items-center justify-between text-left"
                    onClick={() => setActiveStep(activeStep === index ? null : index)}
                  >
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 text-sm">{step.title}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                        <step.icon className="h-3 w-3 text-primary" />
                      </div>
                      {activeStep === index ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </button>
                  {activeStep === index && (
                    <div className="px-3 pb-3 pt-1 text-gray-600 text-xs text-left">
                      {step.description}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Desktop Steps (Grid) */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 relative">
            {steps.map((step, index) => (
              <div
                key={index}
                className="text-center bg-white rounded-lg border border-[#FEEFD4] p-4 md:p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-300 relative group hover:-translate-y-1"
              >
                {/* Number badge with glow */}
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md ring-2 ring-yellow-200">
                    {index + 1}
                  </div>
                </div>

                {/* Step icon */}
                <div className="mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                    <step.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                </div>

                {/* Title and description */}
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2 group-hover:text-orange-600 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed text-center">
                  {step.description}
                </p>

                {/* Hover underline */}
                <div className="w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300 mt-2 md:mt-3"></div>

                {/* Right arrow */}
                {index !== steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-5 h-5 transform -translate-y-1/2 text-orange-200">
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
      
      {/* Benefits */}
      <section className="py-10 md:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold inter text-gray-900 mb-2 md:mb-3">
              Benefits of Shopping with Verified Merchants
            </h2>
            <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto text-left md:text-center">
              Discover why our platform offers a superior shopping experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-3 md:p-4 rounded-lg shadow-sm">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2 md:mb-3">
                  <benefit.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">
                  {benefit.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed text-left">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQs */}
      <section className="py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold inter text-gray-900 mb-2 md:mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto text-left md:text-center">
              Get answers to common questions about our platform
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-3 md:mb-4 border-b border-gray-200 pb-3 md:pb-4 last:border-0">
                <button 
                  className="w-full flex justify-between items-center text-left"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 pr-3 text-left">
                    {faq.question}
                  </h3>
                  {activeFaq === index ? (
                    <ChevronUp className="h-3 w-3 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-3 w-3 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {activeFaq === index && (
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed mt-2 text-left">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8 md:mt-10">
            <p className="text-gray-600 mb-3 md:mb-4 text-xs md:text-sm">Still have questions?</p>
            <Link to="/support">
              <Button className="bg-primary hover:bg-primary-dark text-white text-xs md:text-sm h-8">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-10 md:py-12 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold inter text-gray-900 mb-3 md:mb-4">
            Ready to Shop with Confidence?
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto mb-4 md:mb-6 text-left md:text-center">
            Join thousands of satisfied customers who shop with verified merchants in Nairobi CBD.
          </p>
          <div className="flex flex-row justify-center gap-2 md:gap-3 flex-wrap">
            <Link to="/merchants" className="flex-1 min-w-[120px] max-w-[180px]">
              <Button size="sm" className="w-full bg-primary hover:bg-primary-dark text-white text-xs md:text-sm py-1 h-8">
                Browse Merchants
              </Button>
            </Link>
            <Link to="/auth/register" className="flex-1 min-w-[120px] max-w-[180px]">
              <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary hover:text-white text-xs md:text-sm py-1 h-8">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default HowItWorks;