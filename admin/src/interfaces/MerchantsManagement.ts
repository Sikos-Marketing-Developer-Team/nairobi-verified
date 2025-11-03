export interface Merchant {
  _id: string;
  businessName: string;
  ownerName?: string;
  email: string;
  phone: string;
  verified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  address?: string;
  location?: string;
  businessType?: string;
  category?: string;
  description?: string;
  website?: string;
  yearEstablished?: number;
  logo?: string;
  bannerImage?: string;
  gallery?: string[];
  rating?: number;
  reviews?: number;
  featured?: boolean;
  productsCount?: number;
  totalSales?: number;
  profileCompleteness?: number;
  documentsCompleteness?: number;
  lastLoginAt?: string;
  onboardingStatus?: 'credentials_sent' | 'account_setup' | 'documents_submitted' | 'under_review' | 'completed';
  documents?: {
    businessRegistration?: {
      path?: string;
      uploadedAt?: string;
      originalName?: string;
      fileSize?: number;
      mimeType?: string;
    };
    idDocument?: {
      path?: string;
      uploadedAt?: string;
      originalName?: string;
      fileSize?: number;
      mimeType?: string;
    };
    utilityBill?: {
      path?: string;
      uploadedAt?: string;
      originalName?: string;
      fileSize?: number;
      mimeType?: string;
    };
    additionalDocs?: Array<{
      path?: string;
      uploadedAt?: string;
      originalName?: string;
      fileSize?: number;
      mimeType?: string;
      description?: string;
    }>;
    documentReviewStatus?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'incomplete';
    verificationNotes?: string;
    documentsSubmittedAt?: string;
    documentsReviewedAt?: string;
  };
  verificationHistory?: Array<{
    action: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'resubmitted';
    performedBy?: string;
    performedAt: string;
    notes?: string;
    documentsInvolved?: string[];
  }>;
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
