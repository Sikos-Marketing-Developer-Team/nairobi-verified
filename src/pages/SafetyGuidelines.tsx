import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, AlertTriangle, Eye, CreditCard, MapPin, MessageSquare, Users, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const SafetyGuidelines = () => {
  const guidelines = [
    {
      icon: Shield,
      title: "Verify Merchant Badges",
      description: "Always check for the verified badge on merchant profiles. This indicates they've been physically verified by our team."
    },
    {
      icon: Eye,
      title: "Inspect Before Purchase",
      description: "When possible, visit the physical store to inspect products before making significant purchases."
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Use our secure payment options rather than direct transfers. Keep receipts and transaction records."
    },
    {
      icon: MapPin,
      title: "Meet in Safe Locations",
      description: "For in-person transactions, meet at the merchant's verified business location during daylight hours."
    },
    {
      icon: MessageSquare,
      title: "Keep Communication On-Platform",
      description: "Maintain all communications through our platform for better security and record-keeping."
    },
    {
      icon: AlertTriangle,
      title: "Report Suspicious Activity",
      description: "If you notice anything suspicious, report it immediately through our reporting system."
    }
  ];

  const redFlags = [
    "Merchants requesting payment through unofficial channels",
    "Prices that seem too good to be true",
    "Reluctance to meet at their verified business location",
    "Pressure to complete transactions quickly",
    "Requests for personal financial information",
    "Merchants without the verified badge",
    "Poor quality or inconsistent product photos",
    "Vague or missing contact information"
  ];

  const reportingSteps = [
    "Log into your account and navigate to the merchant's profile",
    "Click the 'Report' button located at the bottom of their profile",
    "Select the appropriate reason for your report",
    "Provide detailed information about the issue",
    "Include any relevant evidence (screenshots, photos, etc.)",
    "Submit your report for review by our team"
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-6">
            <Shield className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold inter text-gray-900 mb-6">
            Safety Guidelines
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Your safety is our priority. Follow these guidelines to ensure a secure and positive 
            experience when shopping with our verified merchants.
          </p>
        </div>
      </section>
      
      {/* Guidelines */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4">
              Shopping Safety Guidelines
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow these best practices to ensure safe transactions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guidelines.map((guideline, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <guideline.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {guideline.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {guideline.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Red Flags */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4">
              Watch Out for These Red Flags
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Be alert to these warning signs that might indicate a potential issue
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-100">
            <div className="grid md:grid-cols-2 gap-4">
              {redFlags.map((flag, index) => (
                <div key={index} className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{flag}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Reporting Issues */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4">
              How to Report Issues
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              If you encounter any problems, follow these steps to report them
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
              <ol className="space-y-4">
                {reportingSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </li>
                ))}
              </ol>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Our Support Team is Here to Help</h4>
                    <p className="text-gray-600 mt-1">
                      For urgent issues or additional assistance, contact our support team directly.
                    </p>
                    <Link to="/support" className="text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block">
                      Contact Support →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Online Security */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4">
              Online Security Tips
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Protect your personal and financial information while shopping online
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Password Security
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Use strong, unique passwords for your account</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Enable two-factor authentication when available</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Never share your password with anyone</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Log out when using shared or public computers</p>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Payment Security
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Only make payments through our secure platform</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Check that the website URL is correct before entering payment details</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Monitor your bank statements regularly for unauthorized charges</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Consider using a credit card for additional protection</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-6">
            Shop with Confidence
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Our platform is designed with your safety in mind. Start exploring verified merchants today.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/merchants">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white">
                Browse Verified Merchants
              </Button>
            </Link>
            <Link to="/support">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default SafetyGuidelines;