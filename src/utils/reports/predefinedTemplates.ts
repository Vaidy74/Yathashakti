import {
  ReportTemplate,
  ReportEntityType,
  ReportFieldType,
  ReportField,
  FilterOperator,
  SortDirection,
} from './reportTypes';

/**
 * Creates predefined system report templates
 * @returns Array of predefined report templates
 */
export const getPredefinedTemplates = (): ReportTemplate[] => {
  const now = new Date();
  
  // Common fields for financial transactions
  const transactionCommonFields: ReportField[] = [
    {
      id: 'transaction-id',
      name: 'Transaction ID',
      entityType: ReportEntityType.TRANSACTION,
      fieldPath: 'id',
      fieldType: ReportFieldType.TEXT,
      includeInReport: true,
    },
    {
      id: 'transaction-date',
      name: 'Transaction Date',
      entityType: ReportEntityType.TRANSACTION,
      fieldPath: 'date',
      fieldType: ReportFieldType.DATE,
      includeInReport: true,
      format: 'dd/MM/yyyy',
    },
    {
      id: 'transaction-amount',
      name: 'Amount',
      entityType: ReportEntityType.TRANSACTION,
      fieldPath: 'amount',
      fieldType: ReportFieldType.CURRENCY,
      includeInReport: true,
      format: '₹#,##0',
    },
    {
      id: 'transaction-type',
      name: 'Type',
      entityType: ReportEntityType.TRANSACTION,
      fieldPath: 'type',
      fieldType: ReportFieldType.ENUM,
      includeInReport: true,
    },
    {
      id: 'transaction-description',
      name: 'Description',
      entityType: ReportEntityType.TRANSACTION,
      fieldPath: 'description',
      fieldType: ReportFieldType.TEXT,
      includeInReport: true,
    },
    {
      id: 'transaction-category',
      name: 'Category',
      entityType: ReportEntityType.TRANSACTION,
      fieldPath: 'category',
      fieldType: ReportFieldType.ENUM,
      includeInReport: true,
    },
    {
      id: 'transaction-reference',
      name: 'Reference',
      entityType: ReportEntityType.TRANSACTION,
      fieldPath: 'reference',
      fieldType: ReportFieldType.TEXT,
      includeInReport: true,
    },
    {
      id: 'transaction-status',
      name: 'Status',
      entityType: ReportEntityType.TRANSACTION,
      fieldPath: 'status',
      fieldType: ReportFieldType.ENUM,
      includeInReport: true,
    },
  ];

  // Common fields for grants
  const grantCommonFields: ReportField[] = [
    {
      id: 'grant-id',
      name: 'Grant ID',
      entityType: ReportEntityType.GRANT,
      fieldPath: 'id',
      fieldType: ReportFieldType.TEXT,
      includeInReport: true,
    },
    {
      id: 'grant-name',
      name: 'Grant Name',
      entityType: ReportEntityType.GRANT,
      fieldPath: 'name',
      fieldType: ReportFieldType.TEXT,
      includeInReport: true,
    },
    {
      id: 'grant-amount',
      name: 'Grant Amount',
      entityType: ReportEntityType.GRANT,
      fieldPath: 'amount',
      fieldType: ReportFieldType.CURRENCY,
      includeInReport: true,
      format: '₹#,##0',
    },
    {
      id: 'grant-start-date',
      name: 'Start Date',
      entityType: ReportEntityType.GRANT,
      fieldPath: 'startDate',
      fieldType: ReportFieldType.DATE,
      includeInReport: true,
      format: 'dd/MM/yyyy',
    },
    {
      id: 'grant-end-date',
      name: 'End Date',
      entityType: ReportEntityType.GRANT,
      fieldPath: 'endDate',
      fieldType: ReportFieldType.DATE,
      includeInReport: true,
      format: 'dd/MM/yyyy',
    },
    {
      id: 'grant-status',
      name: 'Status',
      entityType: ReportEntityType.GRANT,
      fieldPath: 'status',
      fieldType: ReportFieldType.ENUM,
      includeInReport: true,
    },
  ];

  return [
    // Financial Summary Report
    {
      id: 'financial-summary-report',
      name: 'Financial Summary Report',
      description: 'Summary of all financial transactions with totals by category',
      primaryEntityType: ReportEntityType.TRANSACTION,
      fields: [
        ...transactionCommonFields,
        {
          id: 'transaction-amount-sum',
          name: 'Total Amount',
          entityType: ReportEntityType.TRANSACTION,
          fieldPath: 'amount',
          fieldType: ReportFieldType.CURRENCY,
          includeInReport: true,
          format: '₹#,##0',
          aggregation: 'SUM' as any,
        }
      ],
      filters: [],
      sorts: [
        {
          field: transactionCommonFields[1], // Date
          direction: SortDirection.DESCENDING
        }
      ],
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      isSystem: true,
    },
    
    // Monthly Expense Report
    {
      id: 'monthly-expense-report',
      name: 'Monthly Expense Report',
      description: 'Detailed breakdown of expenses by month',
      primaryEntityType: ReportEntityType.TRANSACTION,
      fields: transactionCommonFields,
      filters: [
        {
          id: 'type-filter',
          field: transactionCommonFields[3], // Type
          operator: FilterOperator.EQUALS,
          value: 'EXPENSE',
        }
      ],
      sorts: [
        {
          field: transactionCommonFields[1], // Date
          direction: SortDirection.DESCENDING
        }
      ],
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      isSystem: true,
    },
    
    // Active Grants Report
    {
      id: 'active-grants-report',
      name: 'Active Grants Report',
      description: 'List of all active grants with details',
      primaryEntityType: ReportEntityType.GRANT,
      fields: grantCommonFields,
      filters: [
        {
          id: 'status-filter',
          field: grantCommonFields[5], // Status
          operator: FilterOperator.EQUALS,
          value: 'ACTIVE',
        }
      ],
      sorts: [
        {
          field: grantCommonFields[2], // Amount
          direction: SortDirection.DESCENDING
        }
      ],
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      isSystem: true,
    },
  ];
};
