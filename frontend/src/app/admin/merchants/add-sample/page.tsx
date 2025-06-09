"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FiInfo, FiCheck, FiAlertTriangle } from "react-icons/fi";
import { toast } from "react-hot-toast";

interface Merchant {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  isVerified: boolean;
  salesAmount: string;
  earnings: string;
  withdrawal: string;
}

export default function AddSampleMerchantsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [csvData, setCsvData] = useState<string>(`"","Verification","Profile","","","Gross Sales","Earnings","Withdrawal","Action"
""," ","Amini electronics - Amini electronics (#17 - Amini electronics) Bashkasiraaj@gmail.com 0724165428 Skymall first floor F311, Nairobi, Nairobi County, 00100, Kenya","1 / ∞","0 MB / ∞","KSh 0.00","KSh 0.00","KSh 0.00",""
""," ","Bethel perfect shoes collection - Bethel perfect (#10 - Bethel perfect) Na@gmail.com 0797682211 Next to beba, opposite imenti house, Nairobi, Nairobi County, 00100, Kenya","0 / ∞","0 MB / ∞","KSh 0.00","KSh 0.00","KSh 0.00",""
""," ","Betim skymall - Betim (#16 - Betim) trizahnicko88@gmail.com 0728163262 Sky mall, Luthuli Avenue, Nairobi, Nairobi County, 00100, Kenya","0 / ∞","0 MB / ∞","KSh 0.00","KSh 0.00","KSh 0.00",""
""," ","Glitz&glam - Glitzandglam (#13 - Glitzandglam) ashleyatieno43@gmail.com 0723323666 Sasa Mall 2nd floor, store No: B9, Nairobi, Nairobi County, 00504, Kenya","0 / ∞","0 MB / ∞","KSh 0.00","KSh 0.00","KSh 0.00",""
""," ","United East Africa Texiles - Halima (#11 - Halima) Serekahalima@gmail.com 0720628496 Gaborone road, Nairobi, Nairobi County, 00100, Kenya","0 / ∞","0 MB / ∞","KSh 0.00","KSh 0.00","KSh 0.00",""
""," ","Joy_annes fashion house - Joy_Annes Fashion House (#12 - Joy_Annes Fashion House) Joyannejoan@gmail.com 0715886934 Sasa Mall, First floor A14, Nairobi, Nairobi County, 00504, Kenya","0 / ∞","0 MB / ∞","KSh 0.00","KSh 0.00","KSh 0.00",""
""," ","Lucy fashion line - Lucys fashion line (#14 - Lucys fashion line) Lucyn0526@gmail.com 0726414321 Naccico chambers sunbeam exhibition shop no 21, Nairobi, Nairobi County, 00100, Kenya","0 / ∞","0 MB / ∞","KSh 0.00","KSh 0.00","KSh 0.00",""
""," ","Luxxure kenya - Luxxure Kenya Limited (#8 - Luxxure Kenya Limited) luxxurekenya@gmail.com 0741273952 Sawa mall, 2nd floor shop B19, Nairobi, Nairobi County, 00100, Kenya","1 / ∞","0 MB / ∞","KSh 0.00","KSh 0.00","KSh 0.00",""
""," ","maxwellwanjohi.s - maxwellwanjohi.s (#3 - maxwellwanjohi.s) maxwellwanjohi.s@gmail.com","0 / ∞","0 MB / ∞","KSh 0.00","KSh 0.00","KSh 0.00",""
""," ","Mobicare phone accessories and spare - Mobicare (#15 - Mobicare) Mobicare2022@gmail.com 0716361136 Munyu road, Lizzie building ground floor, Nairobi, Nairobi County, 00100, Kenya","0 / ∞","0 MB / ∞","KSh 0.00","KSh 0.00","KSh 0.00",""
""," ","mrwanjohi11 - mrwanjohi11 (#4 - mrwanjohi11) mrwanjohi11@gmail.com","0 / ∞","0 MB / ∞","KSh 0.00","KSh 0.00","KSh 0.00",""
""," ","B4 - Qualitywigs (#9 - Qualitywigs) Ivonemutheu@gmail.com 0706243617 B4, 2nd floor sawa mall, Nairobi, Nairobi County, 00100, Kenya","0 / ∞","0 MB / ∞","KSh 0.00","KSh 0.00","KSh 0.00",""`);
  
  const [parsedMerchants, setParsedMerchants] = useState<Merchant[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  }>({
    success: 0,
    failed: 0,
    errors: []
  });

  const parseCSV = () => {
    try {
      setParseError(null);
      const lines = csvData.split('\n');
      
      // Skip header row
      const dataRows = lines.slice(1).filter(line => line.trim() !== '');
      
      const merchants: Merchant[] = [];
      
      dataRows.forEach((row, index) => {
        try {
          // Extract the profile information which contains all the merchant details
          const profileMatch = row.match(/"[^"]*","[^"]*","([^"]*)"/);
          
          if (!profileMatch || !profileMatch[1]) {
            throw new Error(`Row ${index + 2}: Could not parse merchant profile information`);
          }
          
          const profileInfo = profileMatch[1];
          
          // Extract business name and ID
          const businessMatch = profileInfo.match(/([^-]+) - ([^(]+) \(#(\d+) - ([^)]+)\)/);
          
          if (!businessMatch) {
            throw new Error(`Row ${index + 2}: Could not parse business name and ID`);
          }
          
          const businessName = businessMatch[1].trim();
          const name = businessMatch[2].trim();
          const id = businessMatch[3].trim();
          
          // Extract email, phone and address
          const contactMatch = profileInfo.match(/\) ([^ ]+) (\d+) (.*)/);
          
          let email = '';
          let phone = '';
          let address = '';
          
          if (contactMatch) {
            email = contactMatch[1].trim();
            phone = contactMatch[2].trim();
            address = contactMatch[3].trim();
          }
          
          // Extract other columns
          const columns = row.split('","');
          const isVerified = columns[3] && columns[3].includes('1') ? true : false;
          const salesAmount = columns[5] || 'KSh 0.00';
          const earnings = columns[6] || 'KSh 0.00';
          const withdrawal = columns[7] || 'KSh 0.00';
          
          merchants.push({
            id,
            name,
            businessName,
            email,
            phone,
            address,
            isVerified,
            salesAmount,
            earnings,
            withdrawal
          });
        } catch (error) {
          console.error(`Error parsing row ${index + 2}:`, error);
          setParseError(`Error parsing row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return;
        }
      });
      
      setParsedMerchants(merchants);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      setParseError(`Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImport = async () => {
    if (parsedMerchants.length === 0) {
      toast.error('No merchants to import');
      return;
    }

    setIsLoading(true);
    
    try {
      // Get existing merchants from localStorage
      const existingMerchantsJSON = localStorage.getItem('merchants');
      const existingMerchants = existingMerchantsJSON ? JSON.parse(existingMerchantsJSON) : [];
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Process merchants
      const successfulImports: Merchant[] = [];
      const failedImports: string[] = [];
      
      // Check for duplicates
      const existingEmails = new Set(existingMerchants.map((m: any) => m.email));
      
      for (const merchant of parsedMerchants) {
        // Simulate some random failures for demonstration
        const shouldFail = Math.random() < 0.1; // 10% chance of failure
        
        if (shouldFail) {
          failedImports.push(`Failed to import ${merchant.businessName}: Random validation error`);
          continue;
        }
        
        if (merchant.email && existingEmails.has(merchant.email)) {
          failedImports.push(`Failed to import ${merchant.businessName}: Email ${merchant.email} already exists`);
          continue;
        }
        
        successfulImports.push(merchant);
        if (merchant.email) {
          existingEmails.add(merchant.email);
        }
      }
      
      // Combine merchants
      const updatedMerchants = [...existingMerchants, ...successfulImports];
      
      // Save to localStorage
      localStorage.setItem('merchants', JSON.stringify(updatedMerchants));
      
      // Set results
      setImportResults({
        success: successfulImports.length,
        failed: failedImports.length,
        errors: failedImports
      });
      
      // Show success toast
      toast.success(`Successfully imported ${successfulImports.length} merchants`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import merchants');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Add Sample Merchants</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Import the provided sample merchants into the system
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sample Merchant Data</CardTitle>
            <CardDescription>
              This is the sample merchant data provided. You can edit it if needed before importing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={csvData} 
              onChange={(e) => setCsvData(e.target.value)} 
              className="font-mono text-sm h-64"
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={parseCSV}>
              Parse Data
            </Button>
          </CardFooter>
        </Card>

        {parseError && (
          <Alert variant="destructive">
            <FiAlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Parsing Data</AlertTitle>
            <AlertDescription>
              {parseError}
            </AlertDescription>
          </Alert>
        )}

        {parsedMerchants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Parsed Merchants</CardTitle>
              <CardDescription>
                Found {parsedMerchants.length} merchants in the data. Review before importing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Business Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Verified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {parsedMerchants.map((merchant, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">#{merchant.id}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">{merchant.businessName}</td>
                        <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{merchant.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{merchant.email}</td>
                        <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{merchant.phone}</td>
                        <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                          {merchant.isVerified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setParsedMerchants([])}>
                Reset
              </Button>
              <Button 
                onClick={handleImport}
                disabled={isLoading}
              >
                {isLoading ? 'Importing...' : 'Import Merchants'}
              </Button>
            </CardFooter>
          </Card>
        )}

        {importResults.success > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Import Results</CardTitle>
              <CardDescription>
                Summary of the merchant import process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400">Successfully Imported</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {importResults.success}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">Failed</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {importResults.failed}
                  </p>
                </div>
              </div>
              
              {importResults.errors.length > 0 && (
                <Alert variant="destructive">
                  <FiInfo className="h-4 w-4" />
                  <AlertTitle>Import Errors</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {importResults.errors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {importResults.success > 0 && (
                <Alert className="mt-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
                  <FiCheck className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    {importResults.success} merchants were successfully imported.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => router.push('/admin/merchants')}>
                Go to Merchants
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}