import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FileText, CheckCircle, MapPin, ShoppingBag, Users, Shield, Building, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PageSkeleton } from '@/components/ui/loading-skeletons';
import { usePageLoading } from '@/hooks/use-loading';
import { Skeleton } from '@/components/ui/skeleton';

const HowItWorks = () => {
  const isLoading = usePageLoading(600);
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
        <section className="py-16 bg-gradient-to-br from-orange-50 to-yellow-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-5/6 mx-auto mb-8" />
            <Skeleton className="h-12 w-48 mx-auto" />
          </div>
        </section>

        <PageSkeleton>
          <div className="space-y-16">
            {/* Steps Section Skeleton */}
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <Skeleton className="h-10 w-1/3 mx-auto" />
                <Skeleton className="h-6 w-2/3 mx-auto" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="text-center space-y-4">
                    <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6 mx-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits Section Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Skeleton className="h-10 w-1/2" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-5/6" />
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-5 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-4 p-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section Skeleton */}
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <Skeleton className="h-10 w-1/3 mx-auto" />
                <Skeleton className="h-6 w-2/3 mx-auto" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
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
      <section className="py-16 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold inter text-gray-900 mb-6">
            How Nairobi Verified Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Our platform connects shoppers with physically verified merchants in Nairobi's CBD, 
            ensuring trust and confidence in every transaction.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/merchants">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white">
                Find Merchants
              </Button>
            </Link>
            <Link to="/auth/register/merchant">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                Register Your Business
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Process Steps */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4">
              Our Verification Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We follow a rigorous process to ensure every merchant on our platform is legitimate and trustworthy.
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
      
      {/* Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4">
              Benefits of Shopping with Verified Merchants
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover why our platform offers a superior shopping experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get answers to common questions about our platform
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-6 border-b border-gray-200 pb-6 last:border-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">Still have questions?</p>
            <Link to="/support">
              <Button className="bg-primary hover:bg-primary-dark text-white">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-6">
            Ready to Shop with Confidence?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join thousands of satisfied customers who shop with verified merchants in Nairobi CBD.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/merchants">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white">
                Browse Merchants
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                Create an Account
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