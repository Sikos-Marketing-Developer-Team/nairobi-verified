import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Cookie, AlertTriangle, Info, Settings, BarChart3, Shield, Share2, ArrowUp, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageLoading } from '@/hooks/use-loading';
import { PageSkeleton } from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

const CookiePolicy = () => {
  const isLoading = usePageLoading(500);
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const sections = [
    { id: 'introduction', title: '1. Introduction', icon: Info },
    { id: 'what-are-cookies', title: '2. What Are Cookies?', icon: Cookie },
    { id: 'why-use-cookies', title: '3. Why We Use Cookies', icon: Settings },
    { id: 'types-of-cookies', title: '4. Types of Cookies', icon: BarChart3 },
    { id: 'cookie-control', title: '5. Cookie Control', icon: Settings },
    { id: 'contact', title: '7. Contact Information', icon: Info }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50">
        <Header />
        
        {/* Hero Section Skeleton */}
        <section className="relative py-16 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
          <div className="max-w-4xl mx-auto text-center px-4">
            <Skeleton className="h-12 w-3/4 mx-auto mb-6 bg-white/20" />
            <Skeleton className="h-6 w-full mb-4 bg-white/20" />
            <Skeleton className="h-6 w-5/6 mx-auto mb-8 bg-white/20" />
            <Skeleton className="h-4 w-48 mx-auto bg-white/20" />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    {i === 2 && (
                      <div className="bg-yellow-50 p-4 rounded-lg space-y-3">
                        <Skeleton className="h-5 w-1/3" />
                        <div className="space-y-2">
                          {Array.from({ length: 3 }).map((_, j) => (
                            <div key={j} className="flex items-start space-x-3">
                              <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
                              <Skeleton className="h-4 flex-1" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50">
      <Header />
      
      {/* Enhanced Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-yellow-600 via-amber-700 to-orange-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-500"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block p-4 bg-white/20 backdrop-blur-sm rounded-2xl mb-8 animate-scale-in">
            <Cookie className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold inter text-white mb-6 animate-fade-in">
            Cookie Policy
          </h1>
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 inline-block">
            <p className="text-lg text-white/90">
              Last Updated: December 20, 2024
            </p>
          </div>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mt-6 leading-relaxed">
            Learn how we use cookies to enhance your experience and protect your privacy.
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
                              ? 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-600'
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
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Info className="h-6 w-6 text-yellow-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-0">1. Introduction</h2>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg mb-6">
                      <p className="text-yellow-800 font-medium mb-2">Cookie Policy Overview</p>
                      <p className="text-yellow-700 text-sm">
                        This policy explains how we use cookies and similar technologies on our website and services.
                      </p>
                    </div>
                    <p>
                      This Cookie Policy explains how Nairobi Verified Ltd. ("we", "us", or "our") uses cookies and similar 
                      technologies to recognize you when you visit our website at nairobiverified.com ("Website"). It explains 
                      what these technologies are and why we use them, as well as your rights to control our use of them.
                    </p>
                    <p>
                      This Cookie Policy should be read together with our Privacy Policy and Terms of Service.
                    </p>
                  </div>
                  
                  <div id="what-are-cookies" className="scroll-mt-8">
                    <div className="flex items-center gap-3 mb-6 mt-12">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Cookie className="h-6 w-6 text-orange-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-0">2. What Are Cookies?</h2>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 my-8">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-orange-100 rounded-full">
                          <Cookie className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Understanding Cookies</h3>
                          <p className="text-gray-700">
                            Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
                            Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, 
                            as well as to provide reporting information.
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-orange-200">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <span className="text-blue-600">🏠</span>
                            First-Party Cookies
                          </h4>
                          <p className="text-sm text-gray-600">Cookies set by the website owner (Nairobi Verified Ltd.)</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-orange-200">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <span className="text-purple-600">🌐</span>
                            Third-Party Cookies
                          </h4>
                          <p className="text-sm text-gray-600">Cookies set by parties other than the website owner for features like analytics and advertising</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div id="types-of-cookies" className="scroll-mt-8">
                    <div className="flex items-center gap-3 mb-6 mt-12">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-0">4. Types of Cookies We Use</h2>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Essential Cookies */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Shield className="h-5 w-5 text-green-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">4.1 Essential Cookies</h3>
                        </div>
                        <p className="text-gray-700 mb-4">
                          These cookies are strictly necessary to provide you with services available through our Website and to 
                          use some of its features, such as access to secure areas.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="bg-white p-3 rounded-lg border border-green-200">
                            <p className="text-sm"><strong>Session cookies</strong> to operate our service</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-green-200">
                            <p className="text-sm"><strong>Authentication cookies</strong> to remember your login status</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-green-200">
                            <p className="text-sm"><strong>Security cookies</strong> for fraud prevention and site integrity</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Analytics Cookies */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">4.3 Analytics and Customization Cookies</h3>
                        </div>
                        <p className="text-gray-700 mb-4">
                          These cookies collect information that is used either in aggregate form to help us understand how our 
                          Website is being used or how effective our marketing campaigns are.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="bg-white p-3 rounded-lg border border-blue-200">
                            <p className="text-sm"><strong>Google Analytics</strong> cookies to track page views and user journeys</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-blue-200">
                            <p className="text-sm"><strong>Hotjar cookies</strong> to understand user behavior and feedback</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-blue-200">
                            <p className="text-sm"><strong>Feature tracking</strong> cookies to track which features are most popular</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Social Media Cookies */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Share2 className="h-5 w-5 text-purple-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">4.5 Social Media Cookies</h3>
                        </div>
                        <p className="text-gray-700 mb-4">
                          These cookies enable you to share pages and content that you find interesting on our Website 
                          through third-party social networking and other websites.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="bg-white p-3 rounded-lg border border-purple-200">
                            <p className="text-sm"><strong>Facebook cookies</strong> for sharing and "Like" functionality</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-purple-200">
                            <p className="text-sm"><strong>Twitter cookies</strong> for sharing content</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-purple-200">
                            <p className="text-sm"><strong>LinkedIn cookies</strong> for professional networking features</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div id="contact" className="scroll-mt-8">
                    <div className="flex items-center gap-3 mb-6 mt-12">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Info className="h-6 w-6 text-gray-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-0">7. Contact Information</h2>
                    </div>
                    
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-8 border border-gray-200">
                      <p className="text-gray-700 mb-6">
                        If you have any questions about our use of cookies or other technologies, please email us at 
                        privacy@nairobiverified.com or contact us at:
                      </p>
                      
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <Cookie className="h-5 w-5 text-yellow-600" />
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
                              <p className="text-sm text-gray-600">0790120841 / 0713740807</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-2xl">📍</span>
                            <div>
                              <p className="font-medium text-gray-900">Address</p>
                              <p className="text-sm text-gray-600">P.O. Box 12345-00100, Nairobi, Kenya</p>
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
                
                {/* Enhanced Cookie preferences section */}
                <div className="mt-12 p-8 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-100 rounded-full">
                      <Settings className="h-8 w-8 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Manage Your Cookie Preferences</h3>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        You can adjust your cookie preferences at any time by clicking on the "Cookie Settings" button in the footer of our website. 
                        You also have control through your browser settings.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">Browser Control</span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Opt-out Options</span>
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">Granular Settings</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Regular Updates</span>
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
                    to="/terms-of-service" 
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors font-medium"
                  >
                    Terms of Service
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

export default CookiePolicy;