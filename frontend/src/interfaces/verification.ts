export interface VerificationStep {
  id: number;
  title: string;
  completed: boolean;
  date: string | null;
  description: string;
}

export interface Document {
  id: string | number;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadDate: string;
  notes?: string;
  fileName: string;
  fileUrl: string;
}

export interface VerificationData {
  status: 'verified' | 'pending' | 'rejected';
  submittedDate: string;
  verificationSteps: VerificationStep[];
}