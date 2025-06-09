"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Store, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MerchantLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      // In a real application, this would be an API call to authenticate
      // For demo purposes, we'll check localStorage for merchant data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get merchants from localStorage
      const merchantsJSON = localStorage.getItem('merchants');
      if (!merchantsJSON) {
        setError("Invalid email or password");
        return;
      }
      
      const merchants = JSON.parse(merchantsJSON);
      const merchant = merchants.find((m: any) => m.email === email);
      
      if (!merchant) {
        setError("Invalid email or password");
        return;
      }
      
      // In a real app, you would hash and compare passwords
      // For demo, we'll check if it's the temporary password or just allow any password
      const isValidPassword = merchant.temporaryPassword === password || password === "password123";
      
      if (!isValidPassword) {
        setError("Invalid email or password");
        return;
      }
      
      // Check if merchant is active
      if (!merchant.isActive) {
        setError("Your account has been deactivated. Please contact support.");
        return;
      }
      
      // Login successful
      // In a real app, you would set authentication tokens/cookies
      localStorage.setItem('currentMerchant', JSON.stringify({
        id: merchant._id,
        name: merchant.fullName,
        email: merchant.email,
        companyName: merchant.companyName,
        isVerified: merchant.isVerified
      }));
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${merchant.fullName}!`,
      });
      
      // Redirect to dashboard
      router.push('/merchant/dashboard');
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Store className="h-12 w-12 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold">Nairobi Verified</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Merchant Login
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your merchant account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    href="/merchant/forgot-password" 
                    className="text-sm text-orange-600 hover:text-orange-500"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link 
                href="/merchant/register" 
                className="text-orange-600 hover:text-orange-500 font-medium"
              >
                Apply to become a merchant
              </Link>
            </div>
            
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              By signing in, you agree to our{" "}
              <Link 
                href="/terms" 
                className="text-orange-600 hover:text-orange-500"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link 
                href="/privacy" 
                className="text-orange-600 hover:text-orange-500"
              >
                Privacy Policy
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}