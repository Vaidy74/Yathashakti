import { ReportEntityType } from './reportTypes';
import { 
  Transaction, 
  TransactionType, 
  TransactionCategory, 
  TransactionStatus, 
  PaymentMethod 
} from '@/types/transaction';

// Mock data interface with additional properties for display
interface MockTransaction extends Omit<Transaction, 'recipient'> {
  recipient?: string; // Optional recipient field for display purposes
}

/**
 * Service to fetch data for reports based on entity type
 */

// Mock transaction data for development
const MOCK_TRANSACTIONS: MockTransaction[] = [
  {
    id: 'tr-001',
    amount: 500000,
    date: new Date('2025-04-15').toISOString(),
    description: 'Initial grant disbursement',
    type: TransactionType.INCOME,
    category: TransactionCategory.GRANT,
    // removed accountId property as it's not in the Transaction interface
    createdAt: new Date('2025-04-15').toISOString(),
    updatedAt: new Date('2025-04-15').toISOString(),
    reference: 'GR-2025-001',
    // Note: We're using 'recipient' for display in reports, even though it's not in the Transaction interface
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    status: TransactionStatus.COMPLETED
  },
  {
    id: 'tr-002',
    amount: 120000,
    date: new Date('2025-04-20').toISOString(),
    description: 'Office rent payment',
    type: TransactionType.EXPENSE,
    category: TransactionCategory.OPERATIONAL,
    // removed accountId property as it's not in the Transaction interface
    createdAt: new Date('2025-04-20').toISOString(),
    updatedAt: new Date('2025-04-20').toISOString(),
    reference: 'EXP-2025-042',
    recipient: 'Property Management Ltd',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    status: TransactionStatus.COMPLETED
  },
  {
    id: 'tr-003',
    amount: 75000,
    date: new Date('2025-04-25').toISOString(),
    description: 'Program supplies',
    type: TransactionType.EXPENSE,
    category: TransactionCategory.OTHER, // Using OTHER as there's no PROGRAM category
    // removed accountId property as it's not in the Transaction interface
    createdAt: new Date('2025-04-25').toISOString(),
    updatedAt: new Date('2025-04-25').toISOString(),
    reference: 'EXP-2025-047',
    recipient: 'Supply Corp',
    paymentMethod: PaymentMethod.ONLINE_PAYMENT, // Using ONLINE_PAYMENT instead of Credit Card
    status: TransactionStatus.COMPLETED
  },
  {
    id: 'tr-004',
    amount: 250000,
    date: new Date('2025-05-01').toISOString(),
    description: 'Grant repayment',
    type: TransactionType.INCOME,
    category: TransactionCategory.REPAYMENT,
    // removed accountId property as it's not in the Transaction interface
    createdAt: new Date('2025-05-01').toISOString(),
    updatedAt: new Date('2025-05-01').toISOString(),
    reference: 'RP-2025-001',
    recipient: 'Yathashakti Foundation',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    status: TransactionStatus.COMPLETED
  },
  {
    id: 'tr-005',
    amount: 45000,
    date: new Date('2025-05-10').toISOString(),
    description: 'Staff salary',
    type: TransactionType.EXPENSE,
    category: TransactionCategory.OPERATIONAL, // Using OPERATIONAL for salary expenses
    // removed accountId property as it's not in the Transaction interface
    createdAt: new Date('2025-05-10').toISOString(),
    updatedAt: new Date('2025-05-10').toISOString(),
    reference: 'SAL-2025-005',
    recipient: 'Staff Payroll',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    status: TransactionStatus.COMPLETED
  },
];

// Mock grant data for development
const MOCK_GRANTS = [
  {
    id: 'gr-001',
    name: 'Health Education Initiative',
    amount: 1000000,
    startDate: new Date('2025-01-15').toISOString(),
    endDate: new Date('2026-01-14').toISOString(),
    status: 'ACTIVE',
    granteeId: 'grantee-001',
    granteeName: 'Swasth Foundation',
    description: 'Grant for health education programs in rural areas',
    interestRate: 5,
    repaymentTerms: '12 months',
    isRevolvingFund: true
  },
  {
    id: 'gr-002',
    name: 'Water Purification Project',
    amount: 750000,
    startDate: new Date('2025-03-01').toISOString(),
    endDate: new Date('2025-12-31').toISOString(),
    status: 'ACTIVE',
    granteeId: 'grantee-002',
    granteeName: 'Clean Water Initiative',
    description: 'Funding for water purification systems in 5 villages',
    interestRate: 3,
    repaymentTerms: '18 months',
    isRevolvingFund: true
  },
  {
    id: 'gr-003',
    name: 'Microbusiness Loans Program',
    amount: 500000,
    startDate: new Date('2025-02-15').toISOString(),
    endDate: new Date('2025-08-14').toISOString(),
    status: 'ACTIVE',
    granteeId: 'grantee-003',
    granteeName: 'Women Entrepreneurs Association',
    description: 'Small business loans for women entrepreneurs',
    interestRate: 2,
    repaymentTerms: '24 months',
    isRevolvingFund: true
  },
];

// Mock grantee data for development
const MOCK_GRANTEES = [
  {
    id: 'grantee-001',
    name: 'Swasth Foundation',
    type: 'NGO',
    contactPerson: 'Anita Sharma',
    email: 'anita@swasth.org',
    phone: '+91-9876543210',
    address: '123 Health Street, Mumbai',
    registrationNumber: 'NGO-MH-2020-12345',
    dateOnboarded: new Date('2024-12-01').toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'grantee-002',
    name: 'Clean Water Initiative',
    type: 'NGO',
    contactPerson: 'Rajesh Kumar',
    email: 'rajesh@cleanwater.org',
    phone: '+91-8765432109',
    address: '456 River Road, Delhi',
    registrationNumber: 'NGO-DL-2019-67890',
    dateOnboarded: new Date('2025-01-15').toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'grantee-003',
    name: 'Women Entrepreneurs Association',
    type: 'SHG',
    contactPerson: 'Priya Mehta',
    email: 'priya@wea.org',
    phone: '+91-7654321098',
    address: '789 Business Park, Bangalore',
    registrationNumber: 'SHG-KA-2021-54321',
    dateOnboarded: new Date('2025-01-20').toISOString(),
    status: 'ACTIVE'
  },
];

/**
 * Convert mock transactions to real transaction objects
 * by removing any non-standard properties
 */
const convertToTransactions = (mockTransactions: MockTransaction[]): Transaction[] => {
  return mockTransactions.map(mock => {
    // Create a new object with only the properties from the Transaction interface
    const transaction: Transaction = {
      id: mock.id,
      date: mock.date,
      description: mock.description,
      type: mock.type,
      category: mock.category,
      amount: mock.amount,
      paymentMethod: mock.paymentMethod,
      reference: mock.reference,
      status: mock.status,
      createdAt: mock.createdAt,
      updatedAt: mock.updatedAt
    };
    
    return transaction;
  });
};

/**
 * Fetch data for reports based on entity type
 * @param entityType Type of entity to fetch data for
 * @param filters Optional filters to apply to the data
 * @returns Promise with the data
 */
export const fetchReportData = async (
  entityType: ReportEntityType,
  filters?: Record<string, any>
): Promise<any[]> => {
  // In a production app, this would make API calls
  // For now, we'll return mock data based on entity type
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let data: any[] = [];
  
  switch (entityType) {
    case ReportEntityType.TRANSACTION:
      data = convertToTransactions([...MOCK_TRANSACTIONS]);
      break;
    case ReportEntityType.GRANT:
      data = [...MOCK_GRANTS];
      break;
    case ReportEntityType.GRANTEE:
      data = [...MOCK_GRANTEES];
      break;
    default:
      data = [];
  }
  
  // Apply any basic filters if provided
  if (filters) {
    data = data.filter(item => {
      // Check if all filter conditions match
      return Object.keys(filters).every(key => {
        // Skip undefined filters
        if (filters[key] === undefined) return true;
        
        // Handle date ranges
        if (key === 'dateRange' && filters.dateRange) {
          const { startDate, endDate } = filters.dateRange;
          const dateField = entityType === ReportEntityType.TRANSACTION ? 'date' : 'startDate';
          const itemDate = new Date(item[dateField]);
          return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
        }
        
        // Handle exact matches
        return item[key] === filters[key];
      });
    });
  }
  
  return data;
};

/**
 * Get available fields for a specific entity type
 * @param entityType Type of entity
 * @returns Array of field definitions
 */
export const getAvailableFieldsForEntityType = (entityType: ReportEntityType): any[] => {
  // In a production app, this could come from an API or be defined in a more comprehensive way
  // This is a simplified version for demo purposes
  
  switch (entityType) {
    case ReportEntityType.TRANSACTION:
      return [
        { id: 'id', name: 'Transaction ID', fieldType: 'TEXT', fieldPath: 'id', includeInReport: true },
        { id: 'date', name: 'Date', fieldType: 'DATE', fieldPath: 'date', includeInReport: true },
        { id: 'description', name: 'Description', fieldType: 'TEXT', fieldPath: 'description', includeInReport: true },
        { id: 'amount', name: 'Amount', fieldType: 'CURRENCY', fieldPath: 'amount', includeInReport: true },
        { id: 'type', name: 'Type', fieldType: 'ENUM', fieldPath: 'type', includeInReport: true },
        { id: 'category', name: 'Category', fieldType: 'TEXT', fieldPath: 'category', includeInReport: true },
        { id: 'recipient', name: 'Recipient', fieldType: 'TEXT', fieldPath: 'recipient', includeInReport: true },
        { id: 'paymentMethod', name: 'Payment Method', fieldType: 'TEXT', fieldPath: 'paymentMethod', includeInReport: true },
        { id: 'status', name: 'Status', fieldType: 'ENUM', fieldPath: 'status', includeInReport: true },
        { id: 'reference', name: 'Reference', fieldType: 'TEXT', fieldPath: 'reference', includeInReport: false },
      ];
    
    case ReportEntityType.GRANT:
      return [
        { id: 'id', name: 'Grant ID', fieldType: 'TEXT', fieldPath: 'id', includeInReport: true },
        { id: 'name', name: 'Grant Name', fieldType: 'TEXT', fieldPath: 'name', includeInReport: true },
        { id: 'amount', name: 'Amount', fieldType: 'CURRENCY', fieldPath: 'amount', includeInReport: true },
        { id: 'startDate', name: 'Start Date', fieldType: 'DATE', fieldPath: 'startDate', includeInReport: true },
        { id: 'endDate', name: 'End Date', fieldType: 'DATE', fieldPath: 'endDate', includeInReport: true },
        { id: 'status', name: 'Status', fieldType: 'ENUM', fieldPath: 'status', includeInReport: true },
        { id: 'granteeName', name: 'Grantee Name', fieldType: 'TEXT', fieldPath: 'granteeName', includeInReport: true },
        { id: 'description', name: 'Description', fieldType: 'TEXT', fieldPath: 'description', includeInReport: false },
        { id: 'interestRate', name: 'Interest Rate', fieldType: 'NUMBER', fieldPath: 'interestRate', includeInReport: true },
        { id: 'repaymentTerms', name: 'Repayment Terms', fieldType: 'TEXT', fieldPath: 'repaymentTerms', includeInReport: false },
        { id: 'isRevolvingFund', name: 'Is Revolving Fund', fieldType: 'BOOLEAN', fieldPath: 'isRevolvingFund', includeInReport: false },
      ];
      
    case ReportEntityType.GRANTEE:
      return [
        { id: 'id', name: 'Grantee ID', fieldType: 'TEXT', fieldPath: 'id', includeInReport: true },
        { id: 'name', name: 'Grantee Name', fieldType: 'TEXT', fieldPath: 'name', includeInReport: true },
        { id: 'type', name: 'Type', fieldType: 'ENUM', fieldPath: 'type', includeInReport: true },
        { id: 'contactPerson', name: 'Contact Person', fieldType: 'TEXT', fieldPath: 'contactPerson', includeInReport: true },
        { id: 'email', name: 'Email', fieldType: 'TEXT', fieldPath: 'email', includeInReport: true },
        { id: 'phone', name: 'Phone', fieldType: 'TEXT', fieldPath: 'phone', includeInReport: true },
        { id: 'address', name: 'Address', fieldType: 'TEXT', fieldPath: 'address', includeInReport: false },
        { id: 'registrationNumber', name: 'Registration Number', fieldType: 'TEXT', fieldPath: 'registrationNumber', includeInReport: true },
        { id: 'dateOnboarded', name: 'Date Onboarded', fieldType: 'DATE', fieldPath: 'dateOnboarded', includeInReport: true },
        { id: 'status', name: 'Status', fieldType: 'ENUM', fieldPath: 'status', includeInReport: true },
      ];
      
    default:
      return [];
  }
};
