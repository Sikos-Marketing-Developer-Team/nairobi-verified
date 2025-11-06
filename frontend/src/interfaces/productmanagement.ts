export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  available: boolean;
  featured: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  available: boolean;
  featured: boolean;
}
