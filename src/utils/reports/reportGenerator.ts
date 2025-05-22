import { 
  ReportConfig, 
  ReportTemplate, 
  ReportFormat,
  ReportEntityType,
  ReportFilter,
  FilterOperator,
  ReportField,
  ReportFieldType,
  ReportAggregation,
  FilterConditionGroup,
  FilterLogicalOperator
} from './reportTypes';
import { generateTransactionPDF, generateTransactionExcel, downloadBlob } from '../exports/exportUtils';
import { Transaction } from '@/types/transaction';

/**
 * Applies report filters to a dataset
 * @param data Array of data items
 * @param filters Array of filters to apply
 * @returns Filtered data array
 */
export const applyFiltersToData = <T>(data: T[], filters: ReportFilter[]): T[] => {
  if (!filters || filters.length === 0) return data;
  
  return data.filter(item => {
    // Item must pass all filters (AND logic)
    return filters.every(filter => {
      const fieldPath = filter.field.fieldPath;
      const fieldValue = getNestedValue(item, fieldPath);
      
      switch (filter.operator) {
        case FilterOperator.EQUALS:
          return fieldValue === filter.value;
        case FilterOperator.NOT_EQUALS:
          return fieldValue !== filter.value;
        case FilterOperator.GREATER_THAN:
          return fieldValue > filter.value;
        case FilterOperator.LESS_THAN:
          return fieldValue < filter.value;
        case FilterOperator.CONTAINS:
          return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
        case FilterOperator.STARTS_WITH:
          return String(fieldValue).toLowerCase().startsWith(String(filter.value).toLowerCase());
        case FilterOperator.ENDS_WITH:
          return String(fieldValue).toLowerCase().endsWith(String(filter.value).toLowerCase());
        case FilterOperator.BETWEEN:
          return fieldValue >= filter.value && fieldValue <= filter.additionalValue;
        case FilterOperator.IN:
          return Array.isArray(filter.value) && filter.value.includes(fieldValue);
        case FilterOperator.NOT_IN:
          return Array.isArray(filter.value) && !filter.value.includes(fieldValue);
        default:
          return true;
      }
    });
  });
};

/**
 * Applies filter condition groups to a dataset
 * @param data Array of data items
 * @param filterGroups Array of filter condition groups to apply
 * @returns Filtered data array
 */
export const applyFilterGroupsToData = <T>(data: T[], filterGroups: FilterConditionGroup[]): T[] => {
  if (!filterGroups || filterGroups.length === 0) return data;
  
  return data.filter(item => {
    // Each top-level group is applied with AND logic
    return filterGroups.every(group => evaluateFilterGroup(item, group));
  });
};

/**
 * Evaluates a filter group against a data item
 * @param item Data item to evaluate
 * @param group Filter condition group
 * @returns Boolean indicating if the item passes the filter group
 */
const evaluateFilterGroup = <T>(item: T, group: FilterConditionGroup): boolean => {
  if (!group.conditions || group.conditions.length === 0) return true;
  
  // Determine if we need ANY condition to match (OR) or ALL conditions to match (AND)
  const evaluator = group.logicalOperator === FilterLogicalOperator.OR
    ? (conditions: boolean[]) => conditions.some(result => result)
    : (conditions: boolean[]) => conditions.every(result => result);
  
  // Evaluate each condition in the group
  const conditionResults = group.conditions.map(condition => {
    // If it's a nested group, recursively evaluate it
    if ('logicalOperator' in condition) {
      return evaluateFilterGroup(item, condition as FilterConditionGroup);
    }
    
    // Otherwise, it's a filter condition
    const filter = condition as ReportFilter;
    const fieldPath = filter.field.fieldPath;
    const fieldValue = getNestedValue(item, fieldPath);
    
    switch (filter.operator) {
      case FilterOperator.EQUALS:
        return fieldValue === filter.value;
      case FilterOperator.NOT_EQUALS:
        return fieldValue !== filter.value;
      case FilterOperator.GREATER_THAN:
        return fieldValue > filter.value;
      case FilterOperator.LESS_THAN:
        return fieldValue < filter.value;
      case FilterOperator.CONTAINS:
        return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
      case FilterOperator.STARTS_WITH:
        return String(fieldValue).toLowerCase().startsWith(String(filter.value).toLowerCase());
      case FilterOperator.ENDS_WITH:
        return String(fieldValue).toLowerCase().endsWith(String(filter.value).toLowerCase());
      case FilterOperator.BETWEEN:
        return fieldValue >= filter.value && fieldValue <= filter.additionalValue;
      case FilterOperator.IN:
        return Array.isArray(filter.value) && filter.value.includes(fieldValue);
      case FilterOperator.NOT_IN:
        return Array.isArray(filter.value) && !filter.value.includes(fieldValue);
      default:
        return true;
    }
  });
  
  // Apply the logical operator to the results
  return evaluator(conditionResults);
};

/**
 * Applies field selection to data and performs any aggregations
 * @param data Array of data items
 * @param fields Array of fields to include
 * @returns Processed data for display
 */
export const applyFieldSelectionToData = <T>(data: T[], fields: ReportField[]): any[] => {
  if (!data || data.length === 0) return [];
  
  // First pass: Transform data to include only the selected fields
  const transformedData = data.map(item => {
    const result: Record<string, any> = {};
    
    fields.forEach(field => {
      const fieldValue = getNestedValue(item, field.fieldPath);
      result[field.id] = fieldValue;
    });
    
    return result;
  });
  
  // Second pass: Apply aggregations if needed
  const fieldsWithAggregation = fields.filter(f => f.aggregation);
  
  if (fieldsWithAggregation.length > 0) {
    // For each field with aggregation, calculate the aggregated value
    const aggregations: Record<string, any> = {};
    
    fieldsWithAggregation.forEach(field => {
      const values = transformedData.map(item => item[field.id]).filter(val => val !== null && val !== undefined);
      
      switch (field.aggregation) {
        case ReportAggregation.SUM:
          aggregations[field.id] = values.reduce((sum, val) => sum + (Number(val) || 0), 0);
          break;
        case ReportAggregation.AVERAGE:
          if (values.length === 0) {
            aggregations[field.id] = 0;
          } else {
            aggregations[field.id] = values.reduce((sum, val) => sum + (Number(val) || 0), 0) / values.length;
          }
          break;
        case ReportAggregation.MIN:
          aggregations[field.id] = values.length > 0 ? Math.min(...values.map(v => Number(v))) : 0;
          break;
        case ReportAggregation.MAX:
          aggregations[field.id] = values.length > 0 ? Math.max(...values.map(v => Number(v))) : 0;
          break;
        case ReportAggregation.COUNT:
          aggregations[field.id] = values.length;
          break;
      }
    });
    
    // Add aggregation row if there are any aggregations
    if (Object.keys(aggregations).length > 0) {
      const aggregationRow = { ...aggregations, isAggregationRow: true };
      transformedData.push(aggregationRow);
    }
  }
  
  return transformedData;
};

/**
 * Applies report filters to a dataset (internal use)
 * @param data Array of data items
 * @param filters Array of filters to apply
 * @returns Filtered data array
 */
const applyFilters = <T>(data: T[], filters: ReportFilter[]): T[] => {
  if (!filters || filters.length === 0) return data;
  
  return data.filter(item => {
    // Item must pass all filters (AND logic)
    return filters.every(filter => {
      const fieldPath = filter.field.fieldPath;
      const fieldValue = getNestedValue(item, fieldPath);
      
      switch (filter.operator) {
        case FilterOperator.EQUALS:
          return fieldValue === filter.value;
        case FilterOperator.NOT_EQUALS:
          return fieldValue !== filter.value;
        case FilterOperator.GREATER_THAN:
          return fieldValue > filter.value;
        case FilterOperator.LESS_THAN:
          return fieldValue < filter.value;
        case FilterOperator.CONTAINS:
          return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
        case FilterOperator.STARTS_WITH:
          return String(fieldValue).toLowerCase().startsWith(String(filter.value).toLowerCase());
        case FilterOperator.ENDS_WITH:
          return String(fieldValue).toLowerCase().endsWith(String(filter.value).toLowerCase());
        case FilterOperator.BETWEEN:
          return fieldValue >= filter.value && fieldValue <= filter.additionalValue;
        case FilterOperator.IN:
          return Array.isArray(filter.value) && filter.value.includes(fieldValue);
        default:
          return true;
      }
    });
  });
};

/**
 * Gets a value from a nested object path
 * @param obj Object to extract value from
 * @param path Dot-notation path to the value
 * @returns The value at the specified path
 */
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

/**
 * Formats a field value according to its type and format
 * @param value The value to format
 * @param field The field definition
 * @returns Formatted string value
 */
const formatFieldValue = (value: any, field: ReportField): string => {
  if (value === undefined || value === null) return '';
  
  switch (field.fieldType) {
    case ReportFieldType.DATE:
      if (!(value instanceof Date)) {
        value = new Date(value);
      }
      return field.format 
        ? formatDate(value, field.format) 
        : value.toLocaleDateString();
    
    case ReportFieldType.CURRENCY:
      return field.format 
        ? formatCurrency(value, field.format) 
        : `₹${value.toLocaleString('en-IN')}`;
    
    case ReportFieldType.NUMBER:
      return field.format 
        ? value.toLocaleString('en-IN') 
        : String(value);
    
    default:
      return String(value);
  }
};

/**
 * Formats a date according to a format string
 * @param date Date to format
 * @param format Format string
 * @returns Formatted date string
 */
const formatDate = (date: Date, format: string): string => {
  // Simple date formatter - in a real app, use a library like date-fns
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year.toString());
};

/**
 * Formats a currency value
 * @param value Value to format
 * @param format Format string
 * @returns Formatted currency string
 */
const formatCurrency = (value: number, format: string): string => {
  // Simple currency formatter
  const formatted = value.toLocaleString('en-IN');
  return format.replace('#,##0', formatted);
};

/**
 * Transforms data according to report template
 * @param data Raw data array
 * @param template Report template
 * @returns Transformed data for report
 */
const transformData = <T>(data: T[], template: ReportTemplate): any[] => {
  return data.map(item => {
    const result: Record<string, any> = {};
    
    // Include only fields marked for inclusion
    template.fields
      .filter(field => field.includeInReport)
      .forEach(field => {
        const fieldValue = getNestedValue(item, field.fieldPath);
        result[field.name] = formatFieldValue(fieldValue, field);
      });
    
    return result;
  });
};

/**
 * Generates a report based on configuration
 * @param config Report configuration
 * @param template Report template
 * @param data Raw data to use for report
 */
export const generateReport = async (
  config: ReportConfig,
  template: ReportTemplate,
  data: any[]
): Promise<void> => {
  try {
    // Apply filters from config or template
    const filters = config.filters || template.filters;
    let filteredData = applyFilters(data, filters);
    
    // Apply filter groups if available
    if (template.filterGroups && template.filterGroups.length > 0) {
      filteredData = applyFilterGroupsToData(filteredData, template.filterGroups);
    }
    
    // Find date field based on primary entity type
    let dateFieldPath = '';
    switch (template.primaryEntityType) {
      case ReportEntityType.TRANSACTION:
        dateFieldPath = 'date';
        break;
      case ReportEntityType.GRANT:
        dateFieldPath = 'startDate';
        break;
      default:
        dateFieldPath = 'createdAt';
    }
    
    // Filter by date range if specified
    if (config.dateRange && config.dateRange.startDate && config.dateRange.endDate) {
      const { startDate, endDate } = config.dateRange;
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(getNestedValue(item, dateFieldPath));
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
      });
    }
    
    // Transform data for report
    const reportData = transformData(filteredData, template);
    
    // Generate report in requested format
    const reportTitle = config.name || template.name;
    
    switch (config.format) {
      case ReportFormat.PDF:
        if (template.primaryEntityType === ReportEntityType.TRANSACTION) {
          const pdfBlob = generateTransactionPDF(filteredData as Transaction[], reportTitle);
          downloadBlob(pdfBlob, `${reportTitle.replace(/\s+/g, '_')}.pdf`);
        } else {
          // For other entity types, we'd have specialized PDF generators
          throw new Error(`PDF generation for ${template.primaryEntityType} not implemented yet`);
        }
        break;
        
      case ReportFormat.EXCEL:
        if (template.primaryEntityType === ReportEntityType.TRANSACTION) {
          const excelBlob = generateTransactionExcel(filteredData as Transaction[], reportTitle);
          downloadBlob(excelBlob, `${reportTitle.replace(/\s+/g, '_')}.xlsx`);
        } else {
          // For other entity types, we'd have specialized Excel generators
          throw new Error(`Excel generation for ${template.primaryEntityType} not implemented yet`);
        }
        break;
        
      case ReportFormat.CSV:
        // Generate CSV
        const csvContent = generateCSV(reportData);
        const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(csvBlob, `${reportTitle.replace(/\s+/g, '_')}.csv`);
        break;
        
      default:
        throw new Error(`Unsupported report format: ${config.format}`);
    }
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

/**
 * Generates CSV content from data
 * @param data Array of objects to convert to CSV
 * @returns CSV string
 */
const generateCSV = (data: any[]): string => {
  if (!data || data.length === 0) return '';
  
  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const headerRow = headers.join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return headers.map(header => {
      const value = item[header];
      // Quote strings containing commas
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    }).join(',');
  });
  
  // Combine header and rows
  return [headerRow, ...rows].join('\n');
};
