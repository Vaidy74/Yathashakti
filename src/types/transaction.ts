export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum TransactionCategory {
  DONATION = 'DONATION',
  GRANT = 'GRANT',
  REPAYMENT = 'REPAYMENT',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  OPERATIONAL = 'OPERATIONAL',
  OTHER = 'OTHER'
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  CHECK = 'CHECK',
  ONLINE_PAYMENT = 'ONLINE_PAYMENT',
  MOBILE_PAYMENT = 'MOBILE_PAYMENT',
  OTHER = 'OTHER'
}

export interface Transaction {
  id: string;
  date: Date | string;
  description: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  reference: string;
  status: TransactionStatus;
  notes?: string | null;
  grantId?: string | null;
  donorId?: string | null;
  serviceProviderId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface TransactionWithRelations extends Transaction {
  grant?: {
    id: string;
    grantIdentifier: string;
    grantee?: {
      id: string;
      name: string;
    } | null;
  } | null;
  donor?: {
    id: string;
    name: string;
  } | null;
  serviceProvider?: {
    id: string;
    name: string;
  } | null;
}

export interface TransactionCreateInput {
  date: Date | string;
  description: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  reference: string;
  status?: TransactionStatus;
  notes?: string | null;
  grantId?: string | null;
  donorId?: string | null;
  serviceProviderId?: string | null;
}

export interface TransactionUpdateInput {
  date?: Date | string;
  description?: string;
  type?: TransactionType;
  category?: TransactionCategory;
  amount?: number;
  paymentMethod?: PaymentMethod;
  reference?: string;
  status?: TransactionStatus;
  notes?: string | null;
  grantId?: string | null;
  donorId?: string | null;
  serviceProviderId?: string | null;
}

export interface TransactionQueryParams {
  type?: TransactionType;
  category?: TransactionCategory;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Financial summary data structure
export interface FinancialSummary {
  income: number;
  expenses: number;
  balance: number;
  categorySummary: {
    [key in TransactionCategory]?: {
      income: number;
      expenses: number;
    };
  };
  recentTransactions: TransactionWithRelations[];
}
