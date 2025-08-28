export interface MerchantDocument {
  businessRegistration?: string;
  idDocument?: string;
  utilityBill?: string;
  additionalDocs?: string[];
}

export interface Merchant {
  _id: string;
  businessName: string;
  email: string;
  phone: string;
  businessType: string;
  location: string;
  category?: string;
  status?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  documents?: MerchantDocument;
  rating?: number;
  totalReviews?: number;
  totalProducts?: number;
  isActive?: boolean;
  description?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  businessHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  documentStatus?: {
    businessRegistration: boolean;
    idDocument: boolean;
    utilityBill: boolean;
    additionalDocs: boolean;
  };
  documentCompleteness?: number;
  isDocumentComplete?: boolean;
  needsVerification?: boolean;
}