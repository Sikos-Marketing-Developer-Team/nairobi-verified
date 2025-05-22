"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiShoppingBag, FiTruck, FiRefreshCw, FiCreditCard, FiUser, FiShield, FiHelpCircle } from 'react-icons/fi';
import MainLayout from '@/components/MainLayout';

// FAQ categories and questions
const faqCategories = [
  {
    id: 'account',
    icon: <FiUser className="w-6 h-6" />,
    title: 'Account & Profile',
    questions: [
      {
        id: 'create-account',
        question: 'How do I create an account?',
        answer: 'To create an account, click on the "Sign Up" button in the top right corner of the website. Fill in your details including your name, email address, and password. Verify your email address by clicking on the link sent to your email, and your account will be ready to use.'
      },
      {
        id: 'reset-password',
        question: 'How do I reset my password?',
        answer: 'If you\'ve forgotten your password, click on the "Sign In" button, then select "Forgot Password". Enter your email address, and we\'ll send you a link to reset your password. Follow the instructions in the email to create a new password.'
      },
      {
        id: 'update-profile',
        question: 'How do I update my profile information?',
        answer: 'Once signed in, go to your account settings by clicking on your profile icon in the top right corner and selecting "My Account". From there, you can edit your personal information, change your password, and update your delivery addresses.'
      },
      {
        id: 'delete-account',
        question: 'Can I delete my account?',
        answer: 'Yes, you can delete your account. Go to your account settings, scroll to the bottom of the page, and click on "Delete Account". Please note that this action is irreversible and all your data will be permanently removed from our system.'
      }
    ]
  },
  {
    id: 'orders',
    icon: <FiShoppingBag className="w-6 h-6" />,
    title: 'Orders & Purchases',
    questions: [
      {
        id: 'track-order',
        question: 'How do I track my order?',
        answer: 'You can track your order by going to "My Orders" in your account dashboard. Alternatively, you can use the "Track Order" feature on our website by entering your order number and email address. You\'ll be able to see the current status of your order and its estimated delivery date.'
      },
      {
        id: 'cancel-order',
        question: 'Can I cancel my order?',
        answer: 'You can cancel your order if it hasn\'t been processed yet. Go to "My Orders" in your account, find the order you want to cancel, and click on "Cancel Order". If the order has already been processed or shipped, you may need to contact our customer support for assistance.'
      },
      {
        id: 'order-confirmation',
        question: 'I didn\'t receive an order confirmation email. What should I do?',
        answer: 'First, check your spam or junk folder. If you still can\'t find the confirmation email, log into your account to verify that your order was placed successfully. If the order appears in your order history, it was processed correctly. If you\'re still concerned, contact our customer support with your order details.'
      },
      {
        id: 'order-history',
        question: 'How can I view my order history?',
        answer: 'To view your order history, sign in to your account and go to "My Orders". Here you\'ll find a list of all your past and current orders, including details such as order status, items purchased, and delivery information.'
      }
    ]
  },
  {
    id: 'shipping',
    icon: <FiTruck className="w-6 h-6" />,
    title: 'Shipping & Delivery',
    questions: [
      {
        id: 'shipping-time',
        question: 'How long will it take to receive my order?',
        answer: 'Delivery times vary depending on your location and the seller. Typically, orders within Nairobi are delivered within 1-3 business days. Orders to other parts of Kenya may take 3-7 business days. International shipping times vary by destination.'
      },
      {
        id: 'shipping-cost',
        question: 'How much does shipping cost?',
        answer: 'Shipping costs are calculated based on your location, the size and weight of the items, and the shipping method selected. You can see the exact shipping cost during checkout before completing your purchase. Some sellers offer free shipping on orders above a certain amount.'
      },
      {
        id: 'delivery-areas',
        question: 'Which areas do you deliver to?',
        answer: 'We deliver to all major cities and towns in Kenya. For international shipping, we currently deliver to selected countries in East Africa. You can check if we deliver to your location by entering your address during checkout.'
      },
      {
        id: 'missing-package',
        question: 'What if my package is lost or damaged?',
        answer: 'If your package is lost, damaged, or significantly delayed, please contact our customer support immediately. Provide your order number and details of the issue. We\'ll investigate the matter and work to resolve it as quickly as possible, which may include sending a replacement or issuing a refund.'
      }
    ]
  },
  {
    id: 'returns',
    icon: <FiRefreshCw className="w-6 h-6" />,
    title: 'Returns & Refunds',
    questions: [
      {
        id: 'return-policy',
        question: 'What is your return policy?',
        answer: 'Our standard return policy allows you to return most items within 14 days of delivery. The item must be in its original condition and packaging. Some products, such as perishable goods or personalized items, may not be eligible for return. Please check the product page for specific return information.'
      },
      {
        id: 'initiate-return',
        question: 'How do I initiate a return?',
        answer: 'To initiate a return, go to "My Orders" in your account, find the order containing the item you want to return, and click on "Return Item". Follow the instructions to complete the return request. Once approved, you\'ll receive instructions on how to send the item back.'
      },
      {
        id: 'refund-time',
        question: 'How long does it take to process a refund?',
        answer: 'Once we receive your returned item and verify its condition, we\'ll process your refund within 3-5 business days. The time it takes for the refund to appear in your account depends on your payment method and financial institution, typically 5-10 business days.'
      },
      {
        id: 'return-shipping',
        question: 'Who pays for return shipping?',
        answer: 'If you\'re returning an item due to a defect, damage, or our error, we\'ll cover the return shipping costs. If you\'re returning an item for any other reason (e.g., you changed your mind), you\'ll be responsible for the return shipping costs unless the seller offers free returns.'
      }
    ]
  },
  {
    id: 'payment',
    icon: <FiCreditCard className="w-6 h-6" />,
    title: 'Payment & Pricing',
    questions: [
      {
        id: 'payment-methods',
        question: 'What payment methods do you accept?',
        answer: 'We accept various payment methods including credit/debit cards (Visa, Mastercard), mobile money (M-Pesa, Airtel Money), bank transfers, and PayPal. Available payment options will be displayed during checkout.'
      },
      {
        id: 'payment-security',
        question: 'Is my payment information secure?',
        answer: 'Yes, we take payment security very seriously. Our website uses SSL encryption to protect your personal and payment information. We do not store your full credit card details on our servers. All payment processing is handled by secure, PCI-compliant payment processors.'
      },
      {
        id: 'currency',
        question: 'Which currency will I be charged in?',
        answer: 'All prices on our website are displayed in Kenyan Shillings (KES). If you\'re paying with an international credit card, your bank will convert the amount to your local currency using their exchange rate.'
      },
      {
        id: 'invoice',
        question: 'How can I get an invoice for my purchase?',
        answer: 'An invoice is automatically generated for every purchase and is included in your order confirmation email. You can also download invoices for any of your orders by going to "My Orders" in your account and clicking on "View Invoice" for the specific order.'
      }
    ]
  },
  {
    id: 'security',
    icon: <FiShield className="w-6 h-6" />,
    title: 'Security & Privacy',
    questions: [
      {
        id: 'data-protection',
        question: 'How do you protect my personal data?',
        answer: 'We implement various security measures to maintain the safety of your personal information. These include using encryption for data transmission, secure servers for data storage, and strict access controls. We also regularly update our security practices to address new threats.'
      },
      {
        id: 'privacy-policy',
        question: 'What information do you collect and how is it used?',
        answer: 'We collect information necessary to process your orders, improve your shopping experience, and communicate with you. This includes contact details, payment information, browsing behavior, and purchase history. For a detailed explanation of what data we collect and how we use it, please refer to our Privacy Policy.'
      },
      {
        id: 'third-parties',
        question: 'Do you share my information with third parties?',
        answer: 'We share your information with third parties only when necessary to fulfill your orders (e.g., with sellers and delivery companies), process payments, or comply with legal obligations. We do not sell your personal information to third parties for marketing purposes. See our Privacy Policy for more details.'
      },
      {
        id: 'account-security',
        question: 'How can I keep my account secure?',
        answer: 'To keep your account secure, we recommend using a strong, unique password, enabling two-factor authentication if available, not sharing your login credentials with others, and signing out when using shared computers. If you suspect unauthorized access to your account, change your password immediately and contact our support team.'
      }
    ]
  }
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('account');
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would filter questions or redirect to search results
    console.log('Searching for:', searchQuery);
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Filter questions based on search query
  const filteredQuestions = searchQuery.trim() !== ''
    ? faqCategories.flatMap(category => 
        category.questions.filter(q => 
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(q => ({ ...q, category: category.id }))
      )
    : [];

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Find answers to common questions and learn how to make the most of Nairobi Verified.
            </p>
            
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-3 pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-600 text-white px-4 py-1.5 rounded-full hover:bg-orange-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </motion.div>

          {/* Search Results */}
          {searchQuery.trim() !== '' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-12"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Results</h2>
              
              {filteredQuestions.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
                  {filteredQuestions.map((question) => (
                    <div key={question.id} className="p-4">
                      <button
                        onClick={() => toggleQuestion(question.id)}
                        className="w-full text-left flex justify-between items-center"
                      >
                        <h3 className="text-lg font-medium text-gray-900">{question.question}</h3>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${expandedQuestions.includes(question.id) ? 'transform rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </button>
                      
                      {expandedQuestions.includes(question.id) && (
                        <div className="mt-2 text-gray-600">
                          <p>{question.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <FiHelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">
                    We couldn't find any answers matching your search. Try using different keywords or browse our FAQ categories below.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* FAQ Categories */}
          {(searchQuery.trim() === '') && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {faqCategories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow ${
                    activeCategory === category.id ? 'ring-2 ring-orange-500' : ''
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-3">
                      {category.icon}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">{category.title}</h2>
                  </div>
                  <p className="text-gray-600">
                    {category.questions.length} articles in this category
                  </p>
                </motion.div>
              ))}
            </div>
          )}

          {/* FAQ Questions for Selected Category */}
          {(searchQuery.trim() === '') && (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {faqCategories.find(c => c.id === activeCategory)?.title} FAQ
                </h2>
              </div>
              
              <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
                {faqCategories
                  .find(c => c.id === activeCategory)
                  ?.questions.map((question) => (
                    <div key={question.id} className="p-4">
                      <button
                        onClick={() => toggleQuestion(question.id)}
                        className="w-full text-left flex justify-between items-center"
                      >
                        <h3 className="text-lg font-medium text-gray-900">{question.question}</h3>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${expandedQuestions.includes(question.id) ? 'transform rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </button>
                      
                      {expandedQuestions.includes(question.id) && (
                        <div className="mt-2 text-gray-600">
                          <p>{question.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* Contact Support Section */}
          <div className="mt-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-8 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
              <p className="mb-6">
                Can't find what you're looking for? Our customer support team is here to help you with any questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href="/contact"
                  className="bg-white text-orange-600 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="tel:+254700000000"
                  className="bg-transparent border border-white text-white px-6 py-3 rounded-md hover:bg-white hover:text-orange-600 transition-colors"
                >
                  Call Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}