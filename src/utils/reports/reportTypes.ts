/**
 * Types and interfaces for the custom report builder
 */

/**
 * Available report formats
 */
export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
}

/**
 * Report field data types
 */
export enum ReportFieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  CURRENCY = 'CURRENCY',
  BOOLEAN = 'BOOLEAN',
  ENUM = 'ENUM',
}

/**
 * Entity types that can be included in reports
 */
export enum ReportEntityType {
  TRANSACTION = 'TRANSACTION',
  GRANT = 'GRANT',
  GRANTEE = 'GRANTEE',
  DONOR = 'DONOR',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  PROGRAM = 'PROGRAM',
}

/**
 * Column/field definition for a report
 */
export interface ReportField {
  id: string;
  name: string;
  entityType: ReportEntityType;
  fieldPath: string; // Path to field in the entity (e.g., "transaction.amount")
  fieldType: ReportFieldType;
  includeInReport: boolean;
  width?: number; // For controlling display width
  format?: string; // Format string (e.g., date format)
  aggregation?: ReportAggregation; // Optional aggregation
}

/**
 * Types of aggregation operations that can be performed on report fields
 */
export enum ReportAggregation {
  SUM = 'SUM',
  AVERAGE = 'AVERAGE',
  COUNT = 'COUNT',
  MIN = 'MIN',
  MAX = 'MAX',
}

/**
 * Filter operator types
 */
export enum FilterOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  CONTAINS = 'CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  BETWEEN = 'BETWEEN',
  IN = 'IN',
  NOT_IN = 'NOT_IN'
}

/**
 * Filter definition for a report
 */
export interface ReportFilter {
  id: string;
  field: ReportField;
  operator: FilterOperator;
  value: any; // Can be a single value or array for IN/NOT_IN operators
  additionalValue?: any; // For BETWEEN operator
}

export enum FilterLogicalOperator {
  AND = 'AND',
  OR = 'OR'
}

export interface FilterConditionGroup {
  id: string;
  logicalOperator: FilterLogicalOperator;
  conditions: (ReportFilter | FilterConditionGroup)[];
}

/**
 * Saved filter preset that can be reused
 */
export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  entityType: string;             // Type of entity this preset is for
  filterGroup: FilterConditionGroup;  // Main filter condition group
  filters?: ReportFilter[];       // For backward compatibility
  createdAt: string;             // ISO date string when preset was created
}

/**
 * Sort direction
 */
export enum SortDirection {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
}

/**
 * Sort criteria for a report
 */
export interface ReportSort {
  field: ReportField;
  direction: SortDirection;
}

/**
 * Report template definition
 */
export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  primaryEntityType: ReportEntityType;
  fields: ReportField[];
  filters: ReportFilter[];
  filterGroups?: FilterConditionGroup[]; // Advanced filter groups
  isPredefined?: boolean;
  savedFilterPresets?: FilterPreset[];
  sorts: ReportSort[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isSystem: boolean; // If true, this is a system template that cannot be deleted
}

/**
 * Report configuration for generating a report
 */
export interface ReportConfig {
  templateId: string;
  name: string;
  format: ReportFormat;
  filters?: ReportFilter[]; // Override template filters
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  includeCharts?: boolean;
}
