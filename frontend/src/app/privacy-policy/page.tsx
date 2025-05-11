"use client";

import { useState } from 'react';
import MainLayout from '@/components/MainLayout';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      content: `
        <p>Last Updated: June 1, 2023</p>
        <p>Welcome to Nairobi Verified. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
        <p>This privacy policy aims to give you information on how Nairobi Verified collects and processes your personal data through your use of this website, including any data you may provide through this website when you sign up for an account, purchase a product, or take part in a promotion.</p>
      `
    },
    {
      id: 'data-collection',
      title: 'Information We Collect',
      content: `
        <p>We collect several types of information from and about users of our website, including:</p>
        <ul class="list-disc pl-5 space-y-2">
          <li><strong>Personal identifiers</strong>, such as name, address, email address, phone number, and payment information when you register or make a purchase.</li>
          <li><strong>Account credentials</strong>, such as usernames and passwords.</li>
          <li><strong>Transaction information</strong>, such as products purchased, prices, and payment methods.</li>
          <li><strong>Technical data</strong>, such as IP address, browser type and version, time zone setting, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
          <li><strong>Usage data</strong>, such as information about how you use our website, products, and services.</li>
          <li><strong>Marketing and communications data</strong>, including your preferences in receiving marketing from us and our third parties and your communication preferences.</li>
        </ul>
      `
    },
    {
      id: 'data-usage',
      title: 'How We Use Your Information',
      content: `
        <p>We use the information we collect about you for various purposes, including to:</p>
        <ul class="list-disc pl-5 space-y-2">
          <li>Create and manage your account</li>
          <li>Process and fulfill your orders</li>
          <li>Provide customer support</li>
          <li>Send administrative information, such as updates to our terms, conditions, and policies</li>
          <li>Send marketing and promotional communications (with your consent)</li>
          <li>Personalize your experience on our website</li>
          <li>Improve our website, products, and services</li>
          <li>Protect against fraudulent or illegal activity</li>
          <li>Comply with legal obligations</li>
        </ul>
      `
    },
    {
      id: 'data-sharing',
      title: 'Information Sharing and Disclosure',
      content: `
        <p>We may share your personal information with:</p>
        <ul class="list-disc pl-5 space-y-2">
          <li><strong>Service providers</strong> who perform services on our behalf, such as payment processing, data analysis, email delivery, hosting services, and customer service.</li>
          <li><strong>Vendors and merchants</strong> on our platform to fulfill your orders and provide customer support.</li>
          <li><strong>Marketing partners</strong> with your consent, to provide you with information about products and services that may interest you.</li>
          <li><strong>Legal authorities</strong> when required by law or to protect our rights, privacy, safety, or property, or that of our users or others.</li>
        </ul>
        <p>We do not sell your personal information to third parties.</p>
      `
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking Technologies',
      content: `
        <p>We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.</p>
        <p>We use the following types of cookies:</p>
        <ul class="list-disc pl-5 space-y-2">
          <li><strong>Essential cookies</strong>: Necessary for the website to function properly.</li>
          <li><strong>Analytical/performance cookies</strong>: Allow us to recognize and count the number of visitors and see how visitors move around our website.</li>
          <li><strong>Functionality cookies</strong>: Enable us to personalize our content for you.</li>
          <li><strong>Targeting cookies</strong>: Record your visit to our website, the pages you have visited, and the links you have followed.</li>
        </ul>
        <p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.</p>
      `
    },
    {
      id: 'data-security',
      title: 'Data Security',
      content: `
        <p>We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.</p>
        <p>We have put in place procedures to deal with any suspected personal data breach and will notify you and any applicable regulator of a breach where we are legally required to do so.</p>
      `
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      content: `
        <p>We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.</p>
        <p>To determine the appropriate retention period for personal data, we consider the amount, nature, and sensitivity of the personal data, the potential risk of harm from unauthorized use or disclosure of your personal data, the purposes for which we process your personal data, and whether we can achieve those purposes through other means, and the applicable legal requirements.</p>
      `
    },
    {
      id: 'your-rights',
      title: 'Your Rights',
      content: `
        <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
        <ul class="list-disc pl-5 space-y-2">
          <li>The right to access your personal information</li>
          <li>The right to rectify inaccurate personal information</li>
          <li>The right to request the deletion of your personal information</li>
          <li>The right to restrict the processing of your personal information</li>
          <li>The right to data portability</li>
          <li>The right to object to the processing of your personal information</li>
          <li>The right to withdraw consent at any time</li>
        </ul>
        <p>To exercise any of these rights, please contact us using the contact information provided below.</p>
      `
    },
    {
      id: 'children',
      title: 'Children\'s Privacy',
      content: `
        <p>Our website is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we can take necessary actions.</p>
      `
    },
    {
      id: 'changes',
      title: 'Changes to This Privacy Policy',
      content: `
        <p>We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date at the top of this privacy policy.</p>
        <p>You are advised to review this privacy policy periodically for any changes. Changes to this privacy policy are effective when they are posted on this page.</p>
      `
    },
    {
      id: 'contact',
      title: 'Contact Us',
      content: `
        <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
        <p>Nairobi Verified<br>
        Email: privacy@nairobiverifed.com<br>
        Phone: +254 700 000 000<br>
        Address: Nairobi, Kenya</p>
      `
    }
  ];

  const toggleSection = (id: string) => {
    if (activeSection === id) {
      setActiveSection(null);
    } else {
      setActiveSection(id);
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-8 sm:p-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
              
              <div className="prose prose-orange max-w-none">
                <p className="text-gray-600 mb-8">
                  This Privacy Policy describes how Nairobi Verified collects, uses, and discloses your personal information when you use our website and services.
                </p>
                
                <div className="space-y-6">
                  {sections.map((section) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex justify-between items-center p-4 text-left font-medium focus:outline-none"
                      >
                        <span className="text-lg font-semibold">{section.title}</span>
                        <svg
                          className={`w-5 h-5 transition-transform ${activeSection === section.id ? 'transform rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </button>
                      
                      {activeSection === section.id && (
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                          <div dangerouslySetInnerHTML={{ __html: section.content }} className="text-gray-700 space-y-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              If you have any questions about our Privacy Policy, please{' '}
              <a href="/contact" className="text-orange-600 hover:underline">contact us</a>.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}