// Shared type definitions for the Grantee module

export interface GranteeFormData {
  name: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  dateOfBirth: string;
  idType: string;
  idNumber: string;
  sector: string;
  programId: string;
  programName: string;
  activities: string;
  notes: string;
  [key: string]: string;
}

export interface DocumentData {
  type: string;
  file: File | null;
  description: string;
  id?: string;         // Document ID if already saved in database
  url?: string;        // URL to the uploaded document
  uploaded?: boolean;  // Whether the document has been uploaded
  uploadedAt?: string; // When the document was uploaded
}

export interface FormErrors {
  name?: string;
  gender?: string;
  phone?: string;
  village?: string;
  district?: string;
  state?: string;
  idType?: string;
  idNumber?: string;
  sector?: string;
  programId?: string;
  form?: string;
  [key: string]: string | undefined;
}

export interface Grantee {
  id: string;
  name: string;
  sector?: string;
  location?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  programs?: string[];
}

export interface GranteeDetail extends Grantee {
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  gender?: string;
  dateOfBirth?: string;
  idType?: string;
  idNumber?: string;
  activities?: string;
  notes?: string;
  documents?: DocumentRecord[];
  grants?: GrantRecord[];
}

export interface DocumentRecord {
  id: string;
  type: string;
  fileUrl: string;
  description?: string;
  uploadedAt: string;
}

export interface GrantRecord {
  programId: string;
  programName: string;
  status: string;
  amount?: number;
  disbursementDate?: string;
  repaid?: number;
  nextPaymentDue?: string;
  nextPaymentAmount?: number;
}

export interface PaginationInfo {
  total: number;
  offset: number;
  limit: number;
}
