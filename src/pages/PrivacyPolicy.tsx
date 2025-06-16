import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Lock, Shield, AlertTriangle, Eye, Database, UserCheck, Clock, ArrowUp, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const sections = [
    { id: 'introduction', title: '1. Introduction', icon: Eye },
    { id: 'information-collection', title: '2. Information We Collect', icon: Database },
    { id: 'usage-data', title: '2.2 Usage Data', icon: Database },
    { id: 'cookies', title: '2.3 Cookies', icon: Database },
    { id: 'information-use', title: '3. How We Use Information', icon: UserCheck },
    { id: 'legal-basis', title: '4. Legal Basis', icon: Shield },
    { id: 'disclosure', title: '5. Information Disclosure', icon: Shield },
    { id: 'retention', title: '6. Data Retention', icon: Clock },
    { id: 'security', title: '7. Data Security', icon: Lock },
    { id: 'rights', title: '8. Your Rights', icon: UserCheck },
    { id: 'contact', title: '12. Contact Us', icon: Eye }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      
      // Update active section based on scroll position
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />
      
      {/* Enhanced Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-500"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block p-4 bg-white/20 backdrop-blur-sm rounded-2xl mb-8 animate-scale-in">
            <Lock className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold inter text-white mb-6 animate-fade-in">
            Privacy Policy
          </h1>
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 inline-block">
            <p className="text-lg text-white/90">
              Last Updated: December 20, 2024
            </p>
          </div>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mt-6 leading-relaxed">
            Your privacy is our priority. Learn how we protect and handle your personal information.
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
                              ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
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
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Eye className="h-6 w-6 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-0">1. Introduction</h2>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6">
                      <p className="text-blue-800 font-medium mb-2">Welcome to Nairobi Verified's Privacy Policy</p>
                      <p className="text-blue-700 text-sm">
                        We respect your privacy and are committed to protecting your personal data. This policy explains our practices clearly and transparently.
                      </p>
                    </div>
                    <p>
                      At Nairobi Verified, we respect your privacy and are committed to protecting your personal data. 
                      This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
                      you use our website, mobile applications, and services (collectively, the "Services").
                    </p>
                    <p>
                      Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, 
                      please do not access or use our Services.
                    </p>
                  </div>
                  
                  <div id="information-collection" className="scroll-mt-8">
                    <div className="flex items-center gap-3 mb-6 mt-12">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Database className="h-6 w-6 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-0">2. Information We Collect</h2>
                    </div>
                    <p>
                      We collect several types of information from and about users of our Services, including:
                    </p>
                    
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 my-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-gray-600" />
                        2.1 Personal Data
                      </h3>
                      <p className="text-gray-700 mb-4">
                        Personal Data refers to information that identifies you or can be used to identify you. We may collect 
                        the following Personal Data:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-2">📞 Contact Information</h4>
                          <p className="text-sm text-gray-600">Name, email address, phone number, and mailing address</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-2">👤 Account Information</h4>
                          <p className="text-sm text-gray-600">Username, password, and account preferences</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-2">📸 Profile Information</h4>
                          <p className="text-sm text-gray-600">Profile picture, bio, and other information you choose to provide</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-2">💳 Payment Information</h4>
                          <p className="text-sm text-gray-600">Credit card details, bank account information, and billing address</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-orange-200 rounded-xl p-6 my-8">
                      <div className="flex items-center gap-2 mb-3">
                        <UserCheck className="h-5 w-5 text-orange-600" />
                        <h4 className="font-semibold text-gray-900">📋 Identity Verification Information</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        For merchants, we may collect business registration documents, identification documents, and other verification information
                      </p>
                    </div>
                  </div>
                  
                  <div id="usage-data" className="scroll-mt-8">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 my-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Database className="h-5 w-5 text-purple-600" />
                        2.2 Usage Data
                      </h3>
                      <p className="text-gray-700 mb-4">
                        We may also collect information about how you access and use our Services, including:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-gray-900 mb-2">📱 Device Information</h4>
                          <p className="text-sm text-gray-600">IP address, device type, operating system, browser type, and mobile network information</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-gray-900 mb-2">📊 Usage Information</h4>
                          <p className="text-sm text-gray-600">Pages visited, time spent on pages, links clicked, and search queries</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-gray-900 mb-2">📍 Location Information</h4>
                          <p className="text-sm text-gray-600">General location based on IP address or more precise location if you grant permission</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-gray-900 mb-2">📋 Log Data</h4>
                          <p className="text-sm text-gray-600">Server logs, error reports, and performance data</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div id="cookies" className="scroll-mt-8">
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 my-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Database className="h-5 w-5 text-yellow-600" />
                        2.3 Cookies and Similar Technologies
                      </h3>
                      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-6">
                        <p className="text-yellow-800 text-sm">
                          🍪 <strong>About Cookies:</strong> We use cookies and similar tracking technologies to track activity on our Services. 
                          Cookies are files with a small amount of data which may include an anonymous unique identifier.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-yellow-200">
                          <h4 className="font-semibold text-gray-900 mb-2">🔧 Essential Cookies</h4>
                          <p className="text-sm text-gray-600">Necessary for the functioning of our Services</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-yellow-200">
                          <h4 className="font-semibold text-gray-900 mb-2">📈 Analytical Cookies</h4>
                          <p className="text-sm text-gray-600">Allow us to recognize and count visitors and see how they move around our Services</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-yellow-200">
                          <h4 className="font-semibold text-gray-900 mb-2">⚙️ Functionality Cookies</h4>
                          <p className="text-sm text-gray-600">Enable us to personalize content and remember your preferences</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-yellow-200">
                          <h4 className="font-semibold text-gray-900 mb-2">🎯 Targeting Cookies</h4>
                          <p className="text-sm text-gray-600">Record your visit and track the pages you have visited and links you have followed</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-4 bg-orange-100 rounded-lg">
                        <p className="text-orange-800 text-sm">
                          <strong>Note:</strong> You can instruct your browser to refuse all cookies, but if you do not accept cookies, 
                          you may not be able to use some portions of our Services.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div id="information-use" className="scroll-mt-8">
                    <div className="flex items-center gap-3 mb-6 mt-12">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <UserCheck className="h-6 w-6 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-0">3. How We Use Your Information</h2>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 my-8">
                      <p className="text-gray-700 mb-6">
                        We use the information we collect for various purposes to provide you with the best possible service:
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-sm font-bold">1</span>
                            </div>
                            <h4 className="font-semibold text-gray-900">Service Provision</h4>
                          </div>
                          <p className="text-sm text-gray-600">To provide and maintain our Services</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 text-sm font-bold">2</span>
                            </div>
                            <h4 className="font-semibold text-gray-900">Transaction Processing</h4>
                          </div>
                          <p className="text-sm text-gray-600">To process transactions and send related information</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 text-sm font-bold">3</span>
                            </div>
                            <h4 className="font-semibold text-gray-900">Verification</h4>
                          </div>
                          <p className="text-sm text-gray-600">To verify merchant identities and physical locations</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              <span className="text-yellow-600 text-sm font-bold">4</span>
                            </div>
                            <h4 className="font-semibold text-gray-900">Communication</h4>
                          </div>
                          <p className="text-sm text-gray-600">To notify you about changes and provide customer support</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-red-600 text-sm font-bold">5</span>
                            </div>
                            <h4 className="font-semibold text-gray-900">Improvement</h4>
                          </div>
                          <p className="text-sm text-gray-600">To analyze usage and improve our Services</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 text-sm font-bold">6</span>
                            </div>
                            <h4 className="font-semibold text-gray-900">Security</h4>
                          </div>
                          <p className="text-sm text-gray-600">To detect, prevent, and address technical and security issues</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Compact presentation of remaining important sections */}
                  <div className="space-y-8 mt-12">
                    <div id="contact" className="scroll-mt-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Eye className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-0">Contact Us</h2>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
                        <p className="text-gray-700 mb-6">
                          If you have any questions about this Privacy Policy, please contact us:
                        </p>
                        
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Shield className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">Nairobi Verified Ltd.</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <span className="text-2xl">📧</span>
                              <div>
                                <p className="font-medium text-gray-900">Email</p>
                                <p className="text-sm text-gray-600">privacy@nairobiverified.com</p>
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
                                <p className="text-sm text-gray-600">Kiambi Road, Nairobi Kenya</p>
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
                </div>
                
                {/* Enhanced Privacy commitment section */}
                <div className="mt-12 p-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Shield className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Your Privacy is Our Priority</h3>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        We are committed to protecting your personal information and respecting your privacy. 
                        Our privacy practices are designed to provide transparency and give you control over your data.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">GDPR Compliant</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Data Minimization</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">User Control</span>
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">Transparent Practices</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Related Links */}
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Link 
                    to="/terms-of-service" 
                    className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors font-medium"
                  >
                    Terms of Service
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

export default PrivacyPolicy;