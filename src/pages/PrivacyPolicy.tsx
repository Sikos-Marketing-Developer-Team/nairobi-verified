import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Lock, Shield, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-6">
            <Lock className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold font-garamond text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Last Updated: December 20, 2024
          </p>
        </div>
      </section>
      
      {/* Privacy Policy Content */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2>1. Introduction</h2>
            <p>
              At Nairobi Verified, we respect your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
              you use our website, mobile applications, and services (collectively, the "Services").
            </p>
            <p>
              Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, 
              please do not access or use our Services.
            </p>
            
            <h2>2. Information We Collect</h2>
            <p>
              We collect several types of information from and about users of our Services, including:
            </p>
            
            <h3>2.1 Personal Data</h3>
            <p>
              Personal Data refers to information that identifies you or can be used to identify you. We may collect 
              the following Personal Data:
            </p>
            <ul>
              <li><strong>Contact Information:</strong> Name, email address, phone number, and mailing address</li>
              <li><strong>Account Information:</strong> Username, password, and account preferences</li>
              <li><strong>Profile Information:</strong> Profile picture, bio, and other information you choose to provide</li>
              <li><strong>Payment Information:</strong> Credit card details, bank account information, and billing address</li>
              <li><strong>Identity Verification Information:</strong> For merchants, we may collect business registration documents, identification documents, and other verification information</li>
            </ul>
            
            <h3>2.2 Usage Data</h3>
            <p>
              We may also collect information about how you access and use our Services, including:
            </p>
            <ul>
              <li><strong>Device Information:</strong> IP address, device type, operating system, browser type, and mobile network information</li>
              <li><strong>Usage Information:</strong> Pages visited, time spent on pages, links clicked, and search queries</li>
              <li><strong>Location Information:</strong> General location based on IP address or more precise location if you grant permission</li>
              <li><strong>Log Data:</strong> Server logs, error reports, and performance data</li>
            </ul>
            
            <h3>2.3 Cookies and Similar Technologies</h3>
            <p>
              We use cookies and similar tracking technologies to track activity on our Services and hold certain information. 
              Cookies are files with a small amount of data which may include an anonymous unique identifier.
            </p>
            <p>
              We use the following types of cookies:
            </p>
            <ul>
              <li><strong>Essential Cookies:</strong> Necessary for the functioning of our Services</li>
              <li><strong>Analytical/Performance Cookies:</strong> Allow us to recognize and count the number of visitors and see how visitors move around our Services</li>
              <li><strong>Functionality Cookies:</strong> Enable us to personalize content and remember your preferences</li>
              <li><strong>Targeting Cookies:</strong> Record your visit to our Services, the pages you have visited, and the links you have followed</li>
            </ul>
            <p>
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, 
              if you do not accept cookies, you may not be able to use some portions of our Services.
            </p>
            
            <h2>3. How We Use Your Information</h2>
            <p>
              We use the information we collect for various purposes, including:
            </p>
            <ul>
              <li>To provide and maintain our Services</li>
              <li>To process transactions and send related information</li>
              <li>To verify merchant identities and physical locations</li>
              <li>To notify you about changes to our Services</li>
              <li>To allow you to participate in interactive features of our Services</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information to improve our Services</li>
              <li>To monitor the usage of our Services</li>
              <li>To detect, prevent, and address technical issues</li>
              <li>To send you promotional communications, if you have opted in to receive them</li>
              <li>To protect our rights, property, or safety, and that of our users or others</li>
            </ul>
            
            <h2>4. Legal Basis for Processing</h2>
            <p>
              We process your personal data on the following legal bases:
            </p>
            <ul>
              <li><strong>Contractual Necessity:</strong> Processing is necessary for the performance of a contract with you or to take steps at your request before entering into a contract</li>
              <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate interests, such as improving our Services and growing our business</li>
              <li><strong>Compliance with Legal Obligations:</strong> Processing is necessary for compliance with a legal obligation to which we are subject</li>
              <li><strong>Consent:</strong> You have given consent to the processing of your personal data for one or more specific purposes</li>
            </ul>
            
            <h2>5. Disclosure of Your Information</h2>
            <p>
              We may disclose your personal information to the following categories of recipients:
            </p>
            <ul>
              <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf, such as payment processing, data analysis, email delivery, hosting services, and customer service</li>
              <li><strong>Business Partners:</strong> Partners with whom we jointly offer products or services</li>
              <li><strong>Affiliates:</strong> Our parent company, subsidiaries, and affiliates</li>
              <li><strong>Merchants:</strong> If you interact with a merchant through our Services, we may share information necessary to facilitate the interaction</li>
              <li><strong>Legal Requirements:</strong> To comply with any court order, law, or legal process, including to respond to any government or regulatory request</li>
              <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business</li>
              <li><strong>With Your Consent:</strong> In other ways we may describe when you provide the information or with your consent</li>
            </ul>
            
            <h2>6. Data Retention</h2>
            <p>
              We will retain your personal data only for as long as is necessary for the purposes set out in this 
              Privacy Policy. We will retain and use your personal data to the extent necessary to comply with our 
              legal obligations, resolve disputes, and enforce our legal agreements and policies.
            </p>
            <p>
              We will also retain usage data for internal analysis purposes. Usage data is generally retained for a 
              shorter period, except when this data is used to strengthen the security or to improve the functionality 
              of our Services, or we are legally obligated to retain this data for longer periods.
            </p>
            
            <h2>7. Data Security</h2>
            <p>
              We have implemented appropriate technical and organizational security measures designed to protect the 
              security of any personal information we process. However, please also remember that we cannot guarantee 
              that the internet itself is 100% secure.
            </p>
            <p>
              Although we will do our best to protect your personal information, transmission of personal information 
              to and from our Services is at your own risk. You should only access the Services within a secure environment.
            </p>
            
            <h2>8. Your Data Protection Rights</h2>
            <p>
              Depending on your location, you may have the following data protection rights:
            </p>
            <ul>
              <li><strong>Access:</strong> The right to request copies of your personal data</li>
              <li><strong>Rectification:</strong> The right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete</li>
              <li><strong>Erasure:</strong> The right to request that we erase your personal data, under certain conditions</li>
              <li><strong>Restriction:</strong> The right to request that we restrict the processing of your personal data, under certain conditions</li>
              <li><strong>Object:</strong> The right to object to our processing of your personal data, under certain conditions</li>
              <li><strong>Data Portability:</strong> The right to request that we transfer the data we have collected to another organization, or directly to you, under certain conditions</li>
            </ul>
            <p>
              If you wish to exercise any of these rights, please contact us using the contact information provided below.
            </p>
            
            <h2>9. Children's Privacy</h2>
            <p>
              Our Services are not intended for children under the age of 18. We do not knowingly collect personal 
              information from children under 18. If you are a parent or guardian and you are aware that your child 
              has provided us with personal information, please contact us. If we become aware that we have collected 
              personal information from children without verification of parental consent, we take steps to remove that 
              information from our servers.
            </p>
            
            <h2>10. Third-Party Links</h2>
            <p>
              Our Services may contain links to third-party websites and services that are not owned or controlled by 
              Nairobi Verified. We have no control over, and assume no responsibility for, the content, privacy policies, 
              or practices of any third-party websites or services. We strongly advise you to review the privacy policy 
              of every site you visit.
            </p>
            
            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
            </p>
            <p>
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy 
              are effective when they are posted on this page.
            </p>
            
            <h2>12. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900 mb-2">Nairobi Verified Ltd.</p>
              <div className="space-y-1 text-gray-700">
                <p>📧 Email: privacy@nairobiverified.com</p>
                <p>📞 Phone: +254 700 123 456</p>
                <p>📍 Address: Nairobi CBD, Kenya</p>
                <p>🌐 Website: www.nairobiverified.com</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Your Privacy Matters</h3>
                <p className="text-gray-700">
                  We are committed to protecting your personal information and respecting your privacy. If you have any concerns 
                  about how we handle your data, please don't hesitate to contact us.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/terms-of-service" className="text-primary hover:underline">
              View our Terms of Service
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;