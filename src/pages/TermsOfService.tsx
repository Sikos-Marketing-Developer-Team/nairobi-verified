import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FileText, Shield, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block p-3 bg-gray-200 rounded-full mb-6">
            <FileText className="h-10 w-10 text-gray-700" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold font-garamond text-gray-900 mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Last Updated: December 20, 2024
          </p>
        </div>
      </section>
      
      {/* Terms Content */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Nairobi Verified. These Terms of Service ("Terms") govern your use of our website, 
              mobile applications, and services (collectively, the "Services") operated by Nairobi Verified Ltd. 
              ("we," "us," or "our").
            </p>
            <p>
              By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to 
              these Terms, please do not use our Services.
            </p>
            
            <h2>2. Definitions</h2>
            <p>
              <strong>"User"</strong> refers to any individual who accesses or uses our Services, including 
              customers and merchants.
            </p>
            <p>
              <strong>"Merchant"</strong> refers to businesses or individuals who register to offer products or 
              services through our platform.
            </p>
            <p>
              <strong>"Verified Merchant"</strong> refers to a merchant who has successfully completed our 
              verification process, including document review and physical location verification.
            </p>
            
            <h2>3. Account Registration</h2>
            <p>
              To access certain features of our Services, you may need to register for an account. You agree to 
              provide accurate, current, and complete information during the registration process and to update 
              such information to keep it accurate, current, and complete.
            </p>
            <p>
              You are responsible for safeguarding your account credentials and for all activities that occur 
              under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
            
            <h2>4. Merchant Verification</h2>
            <p>
              Our platform focuses on connecting users with verified merchants in Nairobi's CBD. Our verification 
              process includes:
            </p>
            <ul>
              <li>Document review (business registration, licenses, etc.)</li>
              <li>Physical location verification</li>
              <li>Business legitimacy checks</li>
            </ul>
            <p>
              While we make reasonable efforts to verify merchants, we cannot guarantee that all information 
              provided by merchants is accurate or that merchants will always act in good faith. Users should 
              exercise their own judgment when interacting with merchants.
            </p>
            
            <h2>5. User Conduct</h2>
            <p>
              When using our Services, you agree not to:
            </p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Submit false or misleading information</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with the proper functioning of the Services</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Engage in any activity that could harm our Services or other users</li>
              <li>Use our Services for any illegal or unauthorized purpose</li>
            </ul>
            
            <h2>6. Merchant Responsibilities</h2>
            <p>
              Merchants using our platform agree to:
            </p>
            <ul>
              <li>Provide accurate and complete information about their business and products</li>
              <li>Maintain the accuracy of their business information</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Fulfill orders and provide services as described</li>
              <li>Respond to customer inquiries in a timely manner</li>
              <li>Maintain fair pricing and business practices</li>
              <li>Not engage in deceptive or fraudulent activities</li>
            </ul>
            
            <h2>7. Intellectual Property</h2>
            <p>
              Our Services and their contents, features, and functionality are owned by Nairobi Verified Ltd. 
              and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly 
              perform, republish, download, store, or transmit any of the material on our Services without our 
              prior written consent.
            </p>
            
            <h2>8. User Content</h2>
            <p>
              Users may post content, including reviews, comments, and photos ("User Content"). By posting User 
              Content, you grant us a non-exclusive, royalty-free, perpetual, irrevocable, and fully sublicensable 
              right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, 
              and display such content throughout the world in any media.
            </p>
            <p>
              You represent and warrant that you own or control all rights in and to the User Content you post and 
              that such content does not violate these Terms or any applicable law.
            </p>
            
            <h2>9. Prohibited Content</h2>
            <p>
              You may not post content that:
            </p>
            <ul>
              <li>Is illegal, harmful, threatening, abusive, harassing, defamatory, or invasive of privacy</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains software viruses or any other code designed to interrupt, destroy, or limit the functionality of any computer software or hardware</li>
              <li>Constitutes unauthorized or unsolicited advertising, junk or bulk email ("spamming")</li>
              <li>Impersonates any person or entity</li>
            </ul>
            <p>
              We reserve the right to remove any content that violates these Terms or that we find objectionable.
            </p>
            
            <h2>10. Payments and Fees</h2>
            <p>
              Merchants may be charged fees for using our Services. All fees are non-refundable unless otherwise 
              specified. We reserve the right to change our fees at any time with notice to affected merchants.
            </p>
            <p>
              For transactions between users and merchants, we may facilitate payment processing but are not 
              responsible for the products or services offered by merchants.
            </p>
            
            <h2>11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Nairobi Verified Ltd. and its officers, directors, employees, 
              and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
              including but not limited to, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul>
              <li>Your access to or use of or inability to access or use the Services</li>
              <li>Any conduct or content of any third party on the Services</li>
              <li>Any content obtained from the Services</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
            </ul>
            
            <h2>12. Disclaimer of Warranties</h2>
            <p>
              Our Services are provided on an "as is" and "as available" basis. Nairobi Verified Ltd. makes no 
              warranties, expressed or implied, regarding the operation of the Services or the information, content, 
              or materials included therein.
            </p>
            <p>
              We do not warrant that:
            </p>
            <ul>
              <li>The Services will be uninterrupted or error-free</li>
              <li>Defects will be corrected</li>
              <li>The Services or the server that makes it available are free of viruses or other harmful components</li>
              <li>The information provided by merchants is accurate, reliable, or current</li>
            </ul>
            
            <h2>13. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Nairobi Verified Ltd. and its officers, directors, 
              employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including, 
              without limitation, reasonable legal and accounting fees, arising out of or in any way connected with 
              your access to or use of the Services or your violation of these Terms.
            </p>
            
            <h2>14. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Services immediately, without prior notice 
              or liability, for any reason, including, without limitation, if you breach these Terms.
            </p>
            <p>
              Upon termination, your right to use the Services will immediately cease. If you wish to terminate your 
              account, you may simply discontinue using the Services or contact us to request account deletion.
            </p>
            
            <h2>15. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. If we make material changes to these Terms, 
              we will notify you by email or by posting a notice on our website prior to the changes becoming effective.
            </p>
            <p>
              Your continued use of the Services after the effective date of the revised Terms constitutes your 
              acceptance of the changes.
            </p>
            
            <h2>16. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Kenya, without regard 
              to its conflict of law provisions.
            </p>
            
            <h2>17. Dispute Resolution</h2>
            <p>
              Any dispute arising out of or relating to these Terms or the Services shall first be attempted to be 
              resolved through good faith negotiations. If such negotiations fail, the dispute shall be submitted to 
              the jurisdiction of the courts of Kenya.
            </p>
            
            <h2>18. Severability</h2>
            <p>
              If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck 
              and the remaining provisions shall be enforced.
            </p>
            
            <h2>19. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Nairobi 
              Verified Ltd. regarding the Services and supersede all prior agreements and understandings.
            </p>
            
            <h2>20. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900 mb-2">Nairobi Verified Ltd.</p>
              <div className="space-y-1 text-gray-700">
                <p>📧 Email: legal@nairobiverified.com</p>
                <p>📞 Phone: +254 700 123 456</p>
                <p>📍 Address: Nairobi CBD, Kenya</p>
                <p>🌐 Website: www.nairobiverified.com</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-yellow-50 border border-yellow-100 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Important Notice</h3>
                <p className="text-gray-700">
                  By using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. 
                  If you do not agree to these Terms, please do not use our Services.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/privacy-policy" className="text-primary hover:underline">
              View our Privacy Policy
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;