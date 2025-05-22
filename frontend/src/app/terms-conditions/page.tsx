"use client";

import { useState } from 'react';
import MainLayout from '@/components/MainLayout';

export default function TermsConditions() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      content: `
        <p>Last Updated: June 1, 2023</p>
        <p>Welcome to Nairobi Verified. These terms and conditions outline the rules and regulations for the use of our website and services.</p>
        <p>By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use Nairobi Verified if you do not accept all of the terms and conditions stated on this page.</p>
      `
    },
    {
      id: 'definitions',
      title: 'Definitions',
      content: `
        <p>The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and any or all Agreements:</p>
        <ul class="list-disc pl-5 space-y-2">
          <li><strong>"Client", "You" and "Your"</strong> refers to you, the person accessing this website and accepting the Company's terms and conditions.</li>
          <li><strong>"The Company", "Ourselves", "We", "Our" and "Us"</strong> refers to Nairobi Verified.</li>
          <li><strong>"Party", "Parties", or "Us"</strong> refers to both the Client and ourselves, or either the Client or ourselves.</li>
          <li><strong>"Merchant" or "Vendor"</strong> refers to businesses or individuals selling products or services through our platform.</li>
          <li><strong>"Content"</strong> refers to the information, text, graphics, photos, designs, trademarks, and other materials that are displayed on the website.</li>
          <li><strong>"Products"</strong> refers to the items offered for sale on the website.</li>
        </ul>
        <p>All terms refer to the offer, acceptance, and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner, whether by formal meetings of a fixed duration, or any other means, for the express purpose of meeting the Client's needs in respect of provision of the Company's stated services/products, in accordance with and subject to, prevailing law of Kenya.</p>
      `
    },
    {
      id: 'account',
      title: 'User Accounts',
      content: `
        <p>When you create an account with us, you guarantee that the information you provide is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the website.</p>
        <p>You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password.</p>
        <p>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>
        <p>We reserve the right to refuse service, terminate accounts, remove or edit content, or cancel orders at our sole discretion.</p>
      `
    },
    {
      id: 'purchases',
      title: 'Purchases and Payment',
      content: `
        <p>All purchases through our website are subject to product availability. We reserve the right to limit the quantities of any products or services that we offer.</p>
        <p>We reserve the right to discontinue any product at any time. Any offer for any product or service made on this site is void where prohibited.</p>
        <p>We do not warrant that the quality of any products, services, information, or other material purchased or obtained by you will meet your expectations, or that any errors in the service will be corrected.</p>
        <p>Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the service (or any part or content thereof) without notice at any time.</p>
        <p>We shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the service.</p>
      `
    },
    {
      id: 'merchants',
      title: 'Merchant Terms',
      content: `
        <p>As a merchant on Nairobi Verified, you agree to:</p>
        <ul class="list-disc pl-5 space-y-2">
          <li>Provide accurate and complete information about your business and products</li>
          <li>Maintain the quality of products and services as advertised</li>
          <li>Process and fulfill orders in a timely manner</li>
          <li>Respond to customer inquiries promptly</li>
          <li>Comply with all applicable laws and regulations</li>
          <li>Pay all applicable fees and commissions as outlined in your merchant agreement</li>
        </ul>
        <p>We reserve the right to remove any merchant from our platform for violation of these terms or for any other reason at our sole discretion.</p>
      `
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      content: `
        <p>The website and its original content, features, and functionality are owned by Nairobi Verified and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
        <p>You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our website, except as follows:</p>
        <ul class="list-disc pl-5 space-y-2">
          <li>Your computer may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials.</li>
          <li>You may store files that are automatically cached by your Web browser for display enhancement purposes.</li>
          <li>You may print or download one copy of a reasonable number of pages of the website for your own personal, non-commercial use and not for further reproduction, publication, or distribution.</li>
        </ul>
      `
    },
    {
      id: 'user-content',
      title: 'User-Generated Content',
      content: `
        <p>Our website may allow you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post to the website, including its legality, reliability, and appropriateness.</p>
        <p>By posting content to the website, you grant us the right to use, modify, publicly perform, publicly display, reproduce, and distribute such content on and through the website. You retain any and all of your rights to any content you submit, post, or display on or through the website and you are responsible for protecting those rights.</p>
        <p>You represent and warrant that: (i) the content is yours (you own it) and/or you have the right to use it and the right to grant us the rights and license as provided in these terms, and (ii) that the posting of your content on or through the website does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person or entity.</p>
      `
    },
    {
      id: 'prohibited-uses',
      title: 'Prohibited Uses',
      content: `
        <p>You may use our website only for lawful purposes and in accordance with these Terms. You agree not to use our website:</p>
        <ul class="list-disc pl-5 space-y-2">
          <li>In any way that violates any applicable national or international law or regulation.</li>
          <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
          <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter", "spam", or any other similar solicitation.</li>
          <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
          <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the website, or which, as determined by us, may harm the Company or users of the website or expose them to liability.</li>
        </ul>
      `
    },
    {
      id: 'disclaimer',
      title: 'Disclaimer of Warranties',
      content: `
        <p>The website is provided on an "AS IS" and "AS AVAILABLE" basis. The Company expressly disclaims all warranties of any kind, whether express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
        <p>The Company makes no warranty that (i) the website will meet your requirements, (ii) the website will be uninterrupted, timely, secure, or error-free, (iii) the results that may be obtained from the use of the website will be accurate or reliable, (iv) the quality of any products, services, information, or other material purchased or obtained by you through the website will meet your expectations, and (v) any errors in the website will be corrected.</p>
      `
    },
    {
      id: 'limitation-liability',
      title: 'Limitation of Liability',
      content: `
        <p>In no event shall the Company, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the website; (ii) any conduct or content of any third party on the website; (iii) any content obtained from the website; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.</p>
      `
    },
    {
      id: 'indemnification',
      title: 'Indemnification',
      content: `
        <p>You agree to defend, indemnify, and hold harmless the Company, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the website, including, but not limited to, your User Contributions, any use of the website's content, services, and products other than as expressly authorized in these Terms.</p>
      `
    },
    {
      id: 'changes',
      title: 'Changes to Terms',
      content: `
        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
        <p>By continuing to access or use our website after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the website.</p>
      `
    },
    {
      id: 'contact',
      title: 'Contact Us',
      content: `
        <p>If you have any questions about these Terms, please contact us at:</p>
        <p>Nairobi Verified<br>
        Email: legal@nairobiverifed.com<br>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
              
              <div className="prose prose-orange max-w-none">
                <p className="text-gray-600 mb-8">
                  Please read these terms and conditions carefully before using the Nairobi Verified website and services.
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
              By using our website, you confirm that you have read, understood, and agree to these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}