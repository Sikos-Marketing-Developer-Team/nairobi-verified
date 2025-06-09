"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  sendEmail, 
  generateMerchantWelcomeEmail, 
  generateTemporaryPassword 
} from "@/services/notification";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Textarea,
  Label,
  Separator,
  Switch,
  useToast
} from "@/components/ui";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";

// Form validation schema
const merchantFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  companyName: z.string().min(2, {
    message: "Business name must be at least 2 characters.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  address: z.string().optional(),
  description: z.string().optional(),
  isVerified: z.boolean(),
  isActive: z.boolean(),
  category: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  openingHours: z.string().optional(),
});

type MerchantFormValues = z.infer<typeof merchantFormSchema>;

export default function AddMerchantPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<MerchantFormValues>({
    resolver: zodResolver(merchantFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      companyName: "",
      phone: "",
      address: "",
      description: "",
      isVerified: false,
      isActive: true,
      category: "",
      website: "",
      openingHours: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: MerchantFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Get existing merchants from localStorage
      const existingMerchantsJSON = localStorage.getItem('merchants');
      const existingMerchants = existingMerchantsJSON ? JSON.parse(existingMerchantsJSON) : [];
      
      // Check if email already exists
      const emailExists = existingMerchants.some((merchant: any) => 
        merchant.email === data.email
      );
      
      if (emailExists) {
        toast({
          title: "Error",
          description: "A merchant with this email already exists.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Generate a temporary password for the merchant
      const temporaryPassword = generateTemporaryPassword();
      
      // Create new merchant object
      const newMerchant = {
        _id: uuidv4(),
        fullName: data.fullName,
        email: data.email,
        companyName: data.companyName,
        phone: data.phone,
        address: data.address || "",
        description: data.description || "",
        isVerified: data.isVerified,
        isActive: data.isActive,
        createdAt: new Date().toISOString(),
        verificationStatus: data.isVerified ? 'approved' : 'pending',
        category: data.category || "",
        website: data.website || "",
        openingHours: data.openingHours || "",
        verificationDocuments: {},
        // Store hashed password in a real application
        temporaryPassword: temporaryPassword,
        passwordChanged: false
      };
      
      // Add to existing merchants
      const updatedMerchants = [...existingMerchants, newMerchant];
      
      // Save to localStorage
      localStorage.setItem('merchants', JSON.stringify(updatedMerchants));
      
      // Send welcome email to the merchant
      const loginUrl = `${window.location.origin}/merchant/login`;
      const emailOptions = generateMerchantWelcomeEmail(
        data.fullName,
        data.email,
        temporaryPassword,
        loginUrl
      );
      
      const emailResult = await sendEmail(emailOptions);
      
      if (emailResult.success) {
        toast({
          title: "Merchant Added",
          description: `${data.companyName} has been added successfully and welcome email sent.`,
        });
      } else {
        toast({
          title: "Merchant Added",
          description: `${data.companyName} has been added successfully but welcome email failed to send.`,
        });
        console.error("Email sending failed:", emailResult.error);
      }
      
      // Redirect to merchants list
      router.push('/admin/merchants');
    } catch (error) {
      console.error("Error adding merchant:", error);
      toast({
        title: "Error",
        description: "Failed to add merchant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Add New Merchant</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Create a new merchant account
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin/merchants')}>
            Cancel
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Enter the merchant's business details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Business Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter business name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Business Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Electronics, Fashion, Food" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Business Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the business" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="openingHours"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Opening Hours</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Mon-Fri: 9am-5pm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Business Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Full address of the business" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Enter the merchant's contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Contact Person*</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Email Address*</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Phone Number*</FormLabel>
                      <FormControl>
                        <Input placeholder="+254 7XX XXX XXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Configure the merchant account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }: { field: any }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Status</FormLabel>
                          <FormDescription>
                            Set the merchant account as active or inactive
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isVerified"
                    render={({ field }: { field: any }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Verification Status</FormLabel>
                          <FormDescription>
                            Set the merchant as verified or pending verification
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Merchant"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}