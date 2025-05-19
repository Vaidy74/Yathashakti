import { Grantee } from './grantee';
import { Program } from './program';

export enum GrantStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DISBURSED = 'DISBURSED',
  CURRENT = 'CURRENT',
  COMPLETED = 'COMPLETED',
  DEFAULTED = 'DEFAULTED',
  CANCELLED = 'CANCELLED'
}

export enum RepaymentMethod {
  UPI = 'UPI',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  CHECK = 'CHECK',
  OTHER = 'OTHER'
}

export enum InstallmentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum CommunicationType {
  SMS = 'SMS',
  WHATSAPP_TEXT = 'WHATSAPP_TEXT',
  WHATSAPP_VOICE = 'WHATSAPP_VOICE',
  PHONE_CALL = 'PHONE_CALL',
  EMAIL = 'EMAIL',
  IN_PERSON = 'IN_PERSON',
  OTHER = 'OTHER'
}

export interface Grant {
  id: string;
  grantIdentifier: string;
  amount: number;
  disbursementDate: string;
  status: GrantStatus;
  repaymentRate: number;
  notes?: string;
  programId: string;
  granteeId: string;
  serviceProviderId?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  grantee?: Grantee;
  program?: Program;
  repaymentSchedule?: RepaymentInstallment[];
  repaymentHistory?: Repayment[];
  communications?: Communication[];
  
  // Calculated fields
  totalRepaid?: number;
  percentRepaid?: number;
  remainingAmount?: number;
  nextPaymentDue?: string;
  nextPaymentAmount?: number;
}

export interface RepaymentInstallment {
  id: string;
  dueDate: string;
  expectedAmount: number;
  paidAmount?: number;
  status: InstallmentStatus;
  paymentDate?: string;
  grantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Repayment {
  id: string;
  amount: number;
  date: string;
  method: RepaymentMethod;
  notes?: string;
  grantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Communication {
  id: string;
  date: string;
  type: CommunicationType;
  notes: string;
  evidence?: string;
  grantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GrantFormData {
  granteeId: string;
  programId: string;
  amount: number;
  disbursementDate: string;
  status?: GrantStatus;
  repaymentRate?: number;
  notes?: string;
  serviceProviderId?: string;
  repaymentSchedule?: {
    dueDate: string;
    amount: number;
  }[];
}

export interface GrantPageData {
  grants: Grant[];
  total: number;
  limit: number;
  offset: number;
}

export interface RepaymentFormData {
  amount: number;
  date: string;
  method: RepaymentMethod;
  notes?: string;
}

export interface CommunicationFormData {
  date: string;
  type: CommunicationType;
  notes: string;
  evidence?: string;
  followUpDate?: string;
  assigneeId?: string;
  updateGrantStatus?: boolean;
  newGrantStatus?: GrantStatus;
}

export interface GrantFormErrors {
  granteeId?: string;
  programId?: string;
  amount?: string;
  disbursementDate?: string;
  repaymentRate?: string;
  general?: string;
}

export interface RepaymentFormErrors {
  amount?: string;
  date?: string;
  method?: string;
  general?: string;
}

export interface CommunicationFormErrors {
  date?: string;
  type?: string;
  notes?: string;
  general?: string;
}
