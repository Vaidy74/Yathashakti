import { TransactionCreateInput, TransactionUpdateInput, TransactionType, TransactionStatus, PaymentMethod } from '@/types/transaction';

export interface ValidationError {
  field: string;
  message: string;
}

// Validate a date string or Date object
export const isValidDate = (date: Date | string): boolean => {
  if (!date) return false;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return !isNaN(dateObj.getTime());
};

// Validate amount (must be a positive number)
export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && amount > 0;
};

// Validate transaction type
export const isValidTransactionType = (type: string): boolean => {
  return Object.values(TransactionType).includes(type as TransactionType);
};

// Validate transaction status
export const isValidTransactionStatus = (status: string): boolean => {
  return Object.values(TransactionStatus).includes(status as TransactionStatus);
};

// Validate payment method
export const isValidPaymentMethod = (method: string): boolean => {
  return Object.values(PaymentMethod).includes(method as PaymentMethod);
};

// Main validation function for transaction creation
export const validateTransactionCreate = (data: TransactionCreateInput): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Required fields
  if (!data.description || data.description.trim() === '') {
    errors.push({ field: 'description', message: 'Description is required' });
  }
  
  if (!data.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  } else if (!isValidDate(data.date)) {
    errors.push({ field: 'date', message: 'Invalid date format' });
  }
  
  if (!data.type) {
    errors.push({ field: 'type', message: 'Transaction type is required' });
  } else if (!isValidTransactionType(data.type)) {
    errors.push({ field: 'type', message: 'Invalid transaction type' });
  }
  
  if (!data.category || data.category.trim() === '') {
    errors.push({ field: 'category', message: 'Category is required' });
  }
  
  if (data.amount === undefined || data.amount === null) {
    errors.push({ field: 'amount', message: 'Amount is required' });
  } else if (!isValidAmount(data.amount)) {
    errors.push({ field: 'amount', message: 'Amount must be a positive number' });
  }
  
  if (!data.paymentMethod) {
    errors.push({ field: 'paymentMethod', message: 'Payment method is required' });
  } else if (!isValidPaymentMethod(data.paymentMethod)) {
    errors.push({ field: 'paymentMethod', message: 'Invalid payment method' });
  }
  
  // Status validation (if provided)
  if (data.status && !isValidTransactionStatus(data.status)) {
    errors.push({ field: 'status', message: 'Invalid transaction status' });
  }
  
  // Additional validation for reference fields
  if (data.type === TransactionType.INCOME) {
    if (data.donorId && data.grantId) {
      errors.push({ field: 'general', message: 'An income transaction cannot have both a donor and a grant' });
    }
  }
  
  if (data.type === TransactionType.EXPENSE && data.paymentMethod === PaymentMethod.BANK_TRANSFER && !data.reference) {
    errors.push({ field: 'reference', message: 'Reference is required for bank transfer expenses' });
  }
  
  return errors;
};

// Validation function for transaction updates
export const validateTransactionUpdate = (data: TransactionUpdateInput): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Only validate fields that are provided
  if (data.description !== undefined && data.description.trim() === '') {
    errors.push({ field: 'description', message: 'Description cannot be empty' });
  }
  
  if (data.date !== undefined && !isValidDate(data.date)) {
    errors.push({ field: 'date', message: 'Invalid date format' });
  }
  
  if (data.type !== undefined && !isValidTransactionType(data.type)) {
    errors.push({ field: 'type', message: 'Invalid transaction type' });
  }
  
  if (data.category !== undefined && data.category.trim() === '') {
    errors.push({ field: 'category', message: 'Category cannot be empty' });
  }
  
  if (data.amount !== undefined && !isValidAmount(data.amount)) {
    errors.push({ field: 'amount', message: 'Amount must be a positive number' });
  }
  
  if (data.paymentMethod !== undefined && !isValidPaymentMethod(data.paymentMethod)) {
    errors.push({ field: 'paymentMethod', message: 'Invalid payment method' });
  }
  
  if (data.status !== undefined && !isValidTransactionStatus(data.status)) {
    errors.push({ field: 'status', message: 'Invalid transaction status' });
  }
  
  // Type-specific validations
  if (data.type === TransactionType.INCOME) {
    if (data.donorId && data.grantId) {
      errors.push({ field: 'general', message: 'An income transaction cannot have both a donor and a grant' });
    }
  }
  
  return errors;
};

// Function to format validation errors into a user-friendly message
export const formatValidationErrors = (errors: ValidationError[]): string => {
  if (errors.length === 0) return '';
  
  return errors.map(err => `${err.field}: ${err.message}`).join('\n');
};
