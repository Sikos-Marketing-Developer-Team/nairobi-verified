"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FiInfo, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

export default function MerchantGuide() {
  const router = useRouter();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Merchant Management Guide</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Learn how to add, import, and manage merchants in the system
            </p>
          </div>
          <Button onClick={() => router.push('/admin/merchants')}>
            Back to Merchants
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adding Merchants</CardTitle>
                <CardDescription>
                  Different ways to add merchants to the system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Manual Addition</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>
                        You can add merchants manually through the admin dashboard by following these steps:
                      </p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Navigate to the Merchants page</li>
                        <li>Click on the "Add Merchant" button in the top right corner</li>
                        <li>Fill in all the required merchant details in the form</li>
                        <li>Upload any necessary verification documents</li>
                        <li>Click "Save" to add the merchant to the system</li>
                      </ol>
                      <Alert>
                        <FiInfo className="h-4 w-4" />
                        <AlertTitle>Note</AlertTitle>
                        <AlertDescription>
                          Manually added merchants will need to be verified before they can access all platform features.
                        </AlertDescription>
                      </Alert>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>CSV Import</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>
                        For adding multiple merchants at once, you can use the CSV import feature:
                      </p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Navigate to the Merchants page</li>
                        <li>Click on the "Import" button</li>
                        <li>Download the CSV template if you don't have one already</li>
                        <li>Fill in the template with merchant information</li>
                        <li>Upload the completed CSV file</li>
                        <li>Review the preview to ensure data is correct</li>
                        <li>Click "Import Merchants" to complete the process</li>
                      </ol>
                      <Alert variant="destructive">
                        <FiAlertTriangle className="h-4 w-4" />
                        <AlertTitle>Important</AlertTitle>
                        <AlertDescription>
                          Make sure your CSV file follows the exact format of the template. Any deviations may cause the import to fail.
                        </AlertDescription>
                      </Alert>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Merchant Self-Registration</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p>
                        Merchants can also register themselves through the merchant portal:
                      </p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Merchants visit the registration page on the platform</li>
                        <li>They fill in their business and personal details</li>
                        <li>Upload required verification documents</li>
                        <li>Submit their application</li>
                        <li>Admin receives notification of new merchant registration</li>
                        <li>Admin reviews and approves/rejects the application</li>
                      </ol>
                      <Alert className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
                        <FiCheckCircle className="h-4 w-4" />
                        <AlertTitle>Recommended</AlertTitle>
                        <AlertDescription>
                          Self-registration is the recommended approach as it puts the responsibility of data entry on the merchants themselves.
                        </AlertDescription>
                      </Alert>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Merchant Verification Process</CardTitle>
                <CardDescription>
                  Understanding the verification workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  All merchants must go through a verification process before they can fully use the platform. Here's how the verification process works:
                </p>
                
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="space-y-8 relative">
                    <div className="flex">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center z-10 mr-4">
                        <span className="text-white font-bold">1</span>
                      </div>
                      <div className="pt-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Document Submission</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                          Merchant submits required verification documents such as business registration, ID, and tax certificates.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center z-10 mr-4">
                        <span className="text-white font-bold">2</span>
                      </div>
                      <div className="pt-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Admin Review</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                          Admin reviews the submitted documents for authenticity and completeness.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center z-10 mr-4">
                        <span className="text-white font-bold">3</span>
                      </div>
                      <div className="pt-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Verification Decision</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                          Admin approves or rejects the merchant based on the document review.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center z-10 mr-4">
                        <span className="text-white font-bold">✓</span>
                      </div>
                      <div className="pt-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Account Activation</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                          If approved, the merchant account is activated and they can access all platform features.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/admin/merchants/add-sample')}
                >
                  Add Sample Merchants
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/admin/merchants/import')}
                >
                  Import Merchants
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/admin/merchants')}
                >
                  View All Merchants
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/admin/merchants?verificationFilter=pending')}
                >
                  Pending Verifications
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Required Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2 mt-0.5">
                      <FiCheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Business Registration Certificate</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2 mt-0.5">
                      <FiCheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Tax Compliance Certificate</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2 mt-0.5">
                      <FiCheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">ID Document of Business Owner</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2 mt-0.5">
                      <FiCheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Proof of Business Address</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2 mt-0.5">
                      <FiCheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Bank Account Details</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Alert>
              <FiInfo className="h-4 w-4" />
              <AlertTitle>Need Help?</AlertTitle>
              <AlertDescription>
                If you need further assistance with merchant management, please contact the support team.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}