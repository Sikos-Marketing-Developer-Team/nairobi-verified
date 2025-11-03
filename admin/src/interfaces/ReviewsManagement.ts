export interface Review {
  _id: string;
  rating: number;
  comment?: string;
  content?: string;
  user: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  merchant: {
    businessName: string;
  } | null;
  createdAt: string;
  isReported?: boolean;
  status?: 'active' | 'hidden' | 'flagged';
}
