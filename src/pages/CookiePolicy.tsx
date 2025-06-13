import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Cookie, AlertTriangle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block p-3 bg-gray-200 rounded-full mb-6">
            <Cookie className="h-10 w-10 text-gray-700" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold font-garamond text-gray-900 mb-6">
            Cookie Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Last Updated: June 15, 2024
          </p>
        </div>
      </section>
      
      {/* Cookie Policy Content */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2>1. Introduction</h2>
            <p>
              This Cookie Policy explains how Nairobi Verified Ltd. ("we", "us", or "our") uses cookies and similar 
              technologies to recognize you when you visit our website at nairobiverified.com ("Website"). It explains 
              what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>
            <p>
              This Cookie Policy should be read together with our Privacy Policy and Terms of Service.
            </p>
            
            <h2>2. What Are Cookies?</h2>
            <p>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
              Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, 
              as well as to provide reporting information.
            </p>
            <p>
              Cookies set by the website owner (in this case, Nairobi Verified Ltd.) are called "first-party cookies". 
              Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies 
              enable third-party features or functionality to be provided on or through the website (e.g., advertising, 
              interactive content, and analytics). The parties that set these third-party cookies can recognize your 
              computer both when it visits the website in question and also when it visits certain other websites.
            </p>
            
            <h2>3. Why Do We Use Cookies?</h2>
            <p>
              We use first-party and third-party cookies for several reasons. Some cookies are required for technical 
              reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" 
              cookies. Other cookies also enable us to track and target the interests of our users to enhance the 
              experience on our Website. Third parties serve cookies through our Website for advertising, analytics, 
              and other purposes.
            </p>
            
            <h2>4. Types of Cookies We Use</h2>
            <p>
              The specific types of first and third-party cookies served through our Website and the purposes they 
              perform are described below:
            </p>
            
            <h3>4.1 Essential Cookies</h3>
            <p>
              These cookies are strictly necessary to provide you with services available through our Website and to 
              use some of its features, such as access to secure areas. Because these cookies are strictly necessary 
              to deliver the Website, you cannot refuse them without impacting how our Website functions.
            </p>
            <p>
              Examples of essential cookies we use:
            </p>
            <ul>
              <li>Session cookies to operate our service</li>
              <li>Authentication cookies to remember your login status</li>
              <li>Security cookies for fraud prevention and site integrity</li>
            </ul>
            
            <h3>4.2 Performance and Functionality Cookies</h3>
            <p>
              These cookies are used to enhance the performance and functionality of our Website but are non-essential 
              to their use. However, without these cookies, certain functionality may become unavailable.
            </p>
            <p>
              Examples of performance and functionality cookies we use:
            </p>
            <ul>
              <li>Cookies to remember your preferences (e.g., language, region)</li>
              <li>Cookies to remember your settings (e.g., layout, font size)</li>
              <li>Cookies to remember if we've already asked you certain questions (e.g., survey pop-ups)</li>
            </ul>
            
            <h3>4.3 Analytics and Customization Cookies</h3>
            <p>
              These cookies collect information that is used either in aggregate form to help us understand how our 
              Website is being used or how effective our marketing campaigns are, or to help us customize our Website 
              for you.
            </p>
            <p>
              Examples of analytics and customization cookies we use:
            </p>
            <ul>
              <li>Google Analytics cookies to track page views and user journeys</li>
              <li>Hotjar cookies to understand user behavior and feedback</li>
              <li>Cookies to track which features are most popular</li>
            </ul>
            
            <h3>4.4 Advertising Cookies</h3>
            <p>
              These cookies are used to make advertising messages more relevant to you. They perform functions like 
              preventing the same ad from continuously reappearing, ensuring that ads are properly displayed, and in 
              some cases selecting advertisements that are based on your interests.
            </p>
            <p>
              Examples of advertising cookies we use:
            </p>
            <ul>
              <li>Google Ads cookies to show relevant advertisements</li>
              <li>Facebook Pixel to measure ad effectiveness</li>
              <li>Cookies to track conversion rates from our ads</li>
            </ul>
            
            <h3>4.5 Social Media Cookies</h3>
            <p>
              These cookies are used to enable you to share pages and content that you find interesting on our Website 
              through third-party social networking and other websites. These cookies may also be used for advertising 
              purposes.
            </p>
            <p>
              Examples of social media cookies we use:
            </p>
            <ul>
              <li>Facebook cookies for sharing and "Like" functionality</li>
              <li>Twitter cookies for sharing content</li>
              <li>LinkedIn cookies for professional networking features</li>
            </ul>
            
            <h2>5. How Can You Control Cookies?</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences 
              by clicking on the appropriate opt-out links provided in the cookie banner on our Website.
            </p>
            <p>
              You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject 
              cookies, you may still use our Website though your access to some functionality and areas of our Website 
              may be restricted. As the means by which you can refuse cookies through your web browser controls vary 
              from browser-to-browser, you should visit your browser's help menu for more information.
            </p>
            <p>
              In addition, most advertising networks offer you a way to opt out of targeted advertising. If you would 
              like to find out more information, please visit:
            </p>
            <ul>
              <li><a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance</a></li>
              <li><a href="http://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer">European Interactive Digital Advertising Alliance</a></li>
              <li><a href="https://youradchoices.ca/" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance of Canada</a></li>
            </ul>
            
            <h2>6. How Often Will We Update This Cookie Policy?</h2>
            <p>
              We may update this Cookie Policy from time to time in order to reflect, for example, changes to the 
              cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this 
              Cookie Policy regularly to stay informed about our use of cookies and related technologies.
            </p>
            <p>
              The date at the top of this Cookie Policy indicates when it was last updated.
            </p>
            
            <h2>7. Where Can You Get Further Information?</h2>
            <p>
              If you have any questions about our use of cookies or other technologies, please email us at 
              privacy@nairobiverified.com or contact us at:
            </p>
            <p>
              Nairobi Verified Ltd.<br />
              P.O. Box 12345-00100<br />
              Nairobi, Kenya<br />
              Phone: +254 700 123 456
            </p>
          </div>
          
          <div className="mt-12 p-6 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Cookie Preferences</h3>
                <p className="text-gray-700">
                  You can adjust your cookie preferences at any time by clicking on the "Cookie Settings" button in the footer of our website.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/privacy-policy" className="text-primary hover:underline mr-4">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-primary hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default CookiePolicy;