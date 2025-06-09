"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Store, Upload } from "lucide-react";

// Form validation schema
const productFormSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Quantity must be a non-negative number.",
  }),
  sku: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  tags: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function AddProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // Initialize form with default values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category: "",
      quantity: "",
      sku: "",
      isActive: true,
      isFeatured: false,
      tags: "",
    },
  });

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: File[] = [];
    const newPreviewUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        newImages.push(file);
        newPreviewUrls.push(URL.createObjectURL(file));
      }
    }

    setSelectedImages([...selectedImages, ...newImages]);
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
  };

  // Remove an image
  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    const newPreviewUrls = [...imagePreviewUrls];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviewUrls[index]);
    
    newImages.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setSelectedImages(newImages);
    setImagePreviewUrls(newPreviewUrls);
  };

  // Handle form submission
  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Get existing products from localStorage
      const existingProductsJSON = localStorage.getItem('products');
      const existingProducts = existingProductsJSON ? JSON.parse(existingProductsJSON) : [];
      
      // Create new product object
      const newProduct = {
        _id: uuidv4(),
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category,
        quantity: parseInt(data.quantity),
        sku: data.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        images: imagePreviewUrls.length > 0 ? imagePreviewUrls : ['/placeholder-product.jpg'],
        createdAt: new Date().toISOString(),
        merchantId: "123456", // In a real app, this would be the logged-in merchant's ID
        ratings: {
          average: 0,
          count: 0
        },
        reviews: []
      };
      
      // Add to existing products
      const updatedProducts = [...existingProducts, newProduct];
      
      // Save to localStorage
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
      // Show success message
      toast({
        title: "Product Added",
        description: `${data.name} has been added successfully.`,
      });
      
      // Redirect to products list
      router.push('/merchant/products');
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Merchant Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Merchant Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add New Product
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/merchant/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Add New Product</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Create a new product listing for your store
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                  <CardDescription>
                    Enter the basic details of your product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Product Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Product Description*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your product in detail" 
                            className="min-h-[120px]" 
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
                      name="price"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel>Price (KSh)*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 1999.99" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel>Quantity in Stock*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel>Category*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Electronics, Clothing" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. PROD-12345" {...field} />
                          </FormControl>
                          <FormDescription>
                            Leave blank to auto-generate
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. new, sale, featured (comma separated)" {...field} />
                        </FormControl>
                        <FormDescription>
                          Separate tags with commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>
                    Upload images of your product (up to 5 images)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                    <div className="mx-auto flex flex-col items-center justify-center">
                      <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Drag and drop your images
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        or click to browse files
                      </p>
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={selectedImages.length >= 5}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer ${
                          selectedImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Select Images
                      </label>
                      {selectedImages.length >= 5 && (
                        <p className="text-xs text-amber-600 mt-2">
                          Maximum 5 images allowed
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {imagePreviewUrls.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Selected Images:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {imagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={url} 
                              alt={`Preview ${index + 1}`} 
                              className="h-24 w-full object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Product Settings</CardTitle>
                  <CardDescription>
                    Configure additional settings for your product
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
                              Make this product visible to customers
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
                      name="isFeatured"
                      render={({ field }: { field: any }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Featured Product</FormLabel>
                            <FormDescription>
                              Highlight this product on your store
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
                    {isSubmitting ? "Adding..." : "Add Product"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}