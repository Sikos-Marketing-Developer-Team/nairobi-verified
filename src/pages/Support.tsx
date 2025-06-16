import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MessageSquare, Phone, Mail, Clock, FileText, HelpCircle, ShoppingBag, User, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { usePageLoading } from '@/hooks/use-loading';
import { PageSkeleton } from '@/components/ui/loading-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

const Support = () => {
  const isLoading = usePageLoading(550);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    console.log({ name, email, subject, message });
    setSubmitted(true);
    // Reset form
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    // Show success message
    setTimeout(() => setSubmitted(false), 5000);
  };

  const supportCategories = [
    {
      icon: ShoppingBag,
      title: "Orders & Purchases",
      description: "Get help with your orders, payments, and deliveries"
    },
    {
      icon: User,
      title: "Account Issues",
      description: "Assistance with login problems, account settings, and profile updates"
    },
    {
      icon: AlertTriangle,
      title: "Report a Problem",
      description: "Report suspicious merchants, products, or platform issues"
    },
    {
      icon: HelpCircle,
      title: "General Inquiries",
      description: "Get answers to general questions about our platform"
    }
  ];

  const faqs = [
    {
      question: "How do I create an account?",
      answer: "To create an account, click on the 'Create Account' button in the top right corner of the homepage. Fill in your details in the registration form and submit. You'll receive a confirmation email to verify your account."
    },
    {
      question: "How can I contact a merchant directly?",
      answer: "You can contact merchants through their profile page. Each verified merchant has a 'Contact' button that allows you to send them a message through our platform. Their physical address and business hours are also listed for in-person visits."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We support various payment methods including credit/debit cards, mobile money (M-Pesa, Airtel Money), and bank transfers. The available payment options will be displayed during checkout."
    },
    {
      question: "How do I report a problem with a merchant?",
      answer: "If you encounter any issues with a merchant, you can report them by visiting their profile and clicking the 'Report' button. Provide detailed information about the issue, and our support team will investigate."
    },
    {
      question: "How long does verification take for merchants?",
      answer: "The merchant verification process typically takes 3-5 business days. This includes document review and physical location verification by our team."
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        
        {/* Hero Section Skeleton */}
        <section className="gradient-bg py-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-5/6 mx-auto" />
          </div>
        </section>

        <PageSkeleton>
          <div className="space-y-16">
            {/* Contact Options Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center space-y-4">
                  <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mx-auto" />
                </div>
              ))}
            </div>

            {/* Contact Form & FAQ Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form Skeleton */}
              <div className="space-y-6">
                <Skeleton className="h-8 w-1/2" />
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className={`${i === 3 ? 'h-24' : 'h-12'} w-full`} />
                    </div>
                  ))}
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>

              {/* FAQ Skeleton */}
              <div className="space-y-6">
                <Skeleton className="h-8 w-1/2" />
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ))}
                </div>
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
      <section className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block p-3 bg-purple-100 rounded-full mb-6">
            <MessageSquare className="h-10 w-10 text-purple-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold inter text-gray-900 mb-6">
            Support Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            We're here to help you with any questions or issues you may have.
            Browse our resources or contact our support team.
          </p>
        </div>
      </section>
      
      {/* Support Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4">
              How Can We Help You?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select a category to find the support you need
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {supportCategories.map((category, index) => (
              <Card key={index} className="hover-scale cursor-pointer border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <category.icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {category.description}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                    onClick={() => {
                      document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
                      setSubject(category.title);
                    }}
                  >
                    Get Help
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Contact Information */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4">
              Contact Information
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Reach out to us through any of these channels
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Phone Support
              </h3>
              <p className="text-gray-600 mb-4">
                Call our customer service team
              </p>
              <p className="text-lg font-medium text-purple-700">
                0790120841 / 0713740807
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Email Support
              </h3>
              <p className="text-gray-600 mb-4">
                Send us an email anytime
              </p>
              <p className="text-lg font-medium text-purple-700">
                info@sikosmarketing.com
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Business Hours
              </h3>
              <p className="text-gray-600 mb-4">
                We're available to help you
              </p>
              <p className="text-gray-700">
                Monday - Friday: 8am - 6pm
              </p>
              <p className="text-gray-700">
                Saturday: 9am - 3pm
              </p>
              <p className="text-gray-700">
                Sunday: Closed
              </p>
            </div>
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
              Quick answers to common questions
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
            <Link to="/how-it-works">
              <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                Learn More About How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Contact Form */}
      <section id="contact-form" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Send us a message and we'll get back to you as soon as possible
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    Message Sent!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for contacting us. We'll respond to your inquiry as soon as possible.
                  </p>
                  <Button 
                    onClick={() => setSubmitted(false)}
                    className="bg-primary hover:bg-primary-dark text-white"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      placeholder="What is your inquiry about?"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      placeholder="Please provide details about your inquiry"
                      rows={6}
                    />
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-primary-dark text-white px-8"
                      size="lg"
                    >
                      Send Message
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Resources */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold inter text-gray-900 mb-4">
              Additional Resources
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore these helpful resources
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/how-it-works">
              <Card className="hover-scale cursor-pointer border-0 shadow-lg h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <HelpCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    How It Works
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4 flex-grow">
                    Learn about our verification process and how our platform works.
                  </p>
                  <div className="text-purple-700 font-medium">
                    Learn more →
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/safety-guidelines">
              <Card className="hover-scale cursor-pointer border-0 shadow-lg h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Safety Guidelines
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4 flex-grow">
                    Important safety tips for shopping with verified merchants.
                  </p>
                  <div className="text-purple-700 font-medium">
                    Learn more →
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/terms-of-service">
              <Card className="hover-scale cursor-pointer border-0 shadow-lg h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Terms & Policies
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4 flex-grow">
                    Review our terms of service, privacy policy, and other legal documents.
                  </p>
                  <div className="text-purple-700 font-medium">
                    Learn more →
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

const CheckCircle = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const Shield = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

export default Support;