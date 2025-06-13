import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FileText, Shield, AlertTriangle, Users, Gavel, UserCheck, Building, ArrowUp, Menu, X, Scale, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const sections = [
    { id: 'introduction', title: '1. Introduction', icon: FileText },
    { id: 'definitions', title: '2. Definitions', icon: Users },
    { id: 'account', title: '3. Account Registration', icon: UserCheck },
    { id: 'verification', title: '4. Merchant Verification', icon: Shield },
    { id: 'user-conduct', title: '5. User Conduct', icon: Gavel },
    { id: 'merchant-responsibilities', title: '6. Merchant Responsibilities', icon: Building },
    { id: 'contact', title: '20. Contact Information', icon: FileText }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      
      const sectionElements = sections.map(section => document.getElementById(section.id));
      const currentSection = sectionElements.find(element => {
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom > 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setShowMobileMenu(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <Header />
      
      {/* Enhanced Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-orange-600 via-orange-700 to-red-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-40 left-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 right-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-500"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block p-4 bg-white/20 backdrop-blur-sm rounded-2xl mb-8 animate-scale-in">
            <Scale className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold font-garamond text-white mb-6 animate-fade-in">
            Terms of Service
          </h1>
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 inline-block">
            <p className="text-lg text-white/90">
              Last Updated: December 20, 2024
            </p>
          </div>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mt-6 leading-relaxed">
            Clear and fair terms that govern your use of our platform. Know your rights and responsibilities.
          </p>
        </div>
      </section>
      
      {/* Table of Contents & Content */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Table of Contents - Desktop */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Contents</h3>
                    <button
                      onClick={() => setShowMobileMenu(!showMobileMenu)}
                      className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                      {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  <nav className={`space-y-2 ${showMobileMenu ? 'block' : 'hidden lg:block'}`}>
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            activeSection === section.id
                              ? 'bg-orange-50 text-orange-700 border-l-4 border-orange-600'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{section.title}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 lg:p-12">
                <div className="prose prose-lg max-w-none">
                  
                  <div id="introduction" className="scroll-mt-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FileText className="h-6 w-6 text-orange-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-0">1. Introduction</h2>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg mb-6">
                      <p className="text-orange-800 font-medium mb-2">Welcome to Nairobi Verified</p>
                      <p className="text-orange-700 text-sm">
                        These terms govern your use of our platform and services. By using our services, you agree to these terms.
                      </p>
                    </div>
                    <p>
                      Welcome to Nairobi Verified. These Terms of Service ("Terms") govern your use of our website, 
                      mobile applications, and services (collectively, the "Services") operated by Nairobi Verified Ltd. 
                      ("we," "us," or "our").
                    </p>
                    <p>
                      By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to 
                      these Terms, please do not use our Services.
                    </p>
                  </div>
                  
                  <div id="definitions" className="scroll-mt-8">
                    <div className="flex items-center gap-3 mb-6 mt-12">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-0">2. Definitions</h2>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 my-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Definitions:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            User
                          </h4>
                          <p className="text-sm text-gray-600">Any individual who accesses or uses our Services, including customers and merchants.</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Building className="h-4 w-4 text-green-600" />
                            Merchant
                          </h4>
                          <p className="text-sm text-gray-600">Businesses or individuals who register to offer products or services through our platform.</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-blue-200 md:col-span-2">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-purple-600" />
                            Verified Merchant
                          </h4>
                          <p className="text-sm text-gray-600">A merchant who has successfully completed our verification process, including document review and physical location verification.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div id="verification" className="scroll-mt-8">
                    <div className="flex items-center gap-3 mb-6 mt-12">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Shield className="h-6 w-6 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-0">4. Merchant Verification</h2>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 my-8">
                      <p className="text-gray-700 mb-6">
                        Our platform focuses on connecting users with verified merchants in Nairobi's CBD. Our comprehensive verification process includes:
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 text-sm font-bold">1</span>
                            </div>
                            <h4 className="font-semibold text-gray-900">Document Review</h4>
                          </div>
                          <p className="text-sm text-gray-600">Business registration, licenses, and legal documents verification</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-sm font-bold">2</span>
                            </div>
                            <h4 className="font-semibold text-gray-900">Location Verification</h4>
                          </div>
                          <p className="text-sm text-gray-600">Physical location inspection and address confirmation</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 text-sm font-bold">3</span>
                            </div>
                            <h4 className="font-semibold text-gray-900">Legitimacy Checks</h4>
                          </div>
                          <p className="text-sm text-gray-600">Business legitimacy and operational status verification</p>
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                          <strong>Important:</strong> While we make reasonable efforts to verify merchants, we cannot guarantee that all information 
                          provided by merchants is accurate or that merchants will always act in good faith. Users should 
                          exercise their own judgment when interacting with merchants.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div id="contact" className="scroll-mt-8">
                    <div className="flex items-center gap-3 mb-6 mt-12">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileText className="h-6 w-6 text-gray-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-0">20. Contact Information</h2>
                    </div>
                    
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-8 border border-gray-200">
                      <p className="text-gray-700 mb-6">
                        If you have any questions about these Terms, please contact us at:
                      </p>
                      
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Scale className="h-5 w-5 text-orange-600" />
                          </div>
                          <h3 className="font-bold text-gray-900 text-lg">Nairobi Verified Ltd.</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-2xl">📧</span>
                            <div>
                              <p className="font-medium text-gray-900">Email</p>
                              <p className="text-sm text-gray-600">legal@nairobiverified.com</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-2xl">📞</span>
                            <div>
                              <p className="font-medium text-gray-900">Phone</p>
                              <p className="text-sm text-gray-600">+254 700 123 456</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-2xl">📍</span>
                            <div>
                              <p className="font-medium text-gray-900">Address</p>
                              <p className="text-sm text-gray-600">Nairobi CBD, Kenya</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-2xl">🌐</span>
                            <div>
                              <p className="font-medium text-gray-900">Website</p>
                              <p className="text-sm text-gray-600">www.nairobiverified.com</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Legal notice section */}
                <div className="mt-12 p-8 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border border-red-200 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-full">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Important Legal Notice</h3>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        By using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. 
                        If you do not agree to these Terms, please do not use our Services.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Legally Binding</span>
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">Regular Updates</span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">User Responsibility</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Kenya Law</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Related Links */}
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Link 
                    to="/privacy-policy" 
                    className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors font-medium"
                  >
                    Privacy Policy
                  </Link>
                  <Link 
                    to="/cookie-policy" 
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cookie Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll to top button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all duration-300 z-50 animate-fade-in"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-6 w-6" />
          </button>
        )}
      </section>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;