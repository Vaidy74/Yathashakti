import React, { useState, useEffect } from 'react';
import { 
  ReportField, 
  ReportFilter, 
  FilterOperator, 
  ReportFieldType,
  FilterConditionGroup
} from '@/utils/reports';

interface AdvancedFilterItemProps {
  availableFields: ReportField[];
  filter: ReportFilter;
  onFilterChange: (filter: ReportFilter) => void;
  onRemove: () => void;
  isMultiSelectEnabled?: boolean;
}

/**
 * Enhanced filter component with support for multi-select and advanced operations
 */
const AdvancedFilterItem: React.FC<AdvancedFilterItemProps> = ({
  availableFields,
  filter,
  onFilterChange,
  onRemove,
  isMultiSelectEnabled = true
}) => {
  const [selectedValues, setSelectedValues] = useState<any[]>(
    Array.isArray(filter.value) ? filter.value : filter.value ? [filter.value] : []
  );
  
  // Update filter when selected values change
  useEffect(() => {
    if (isMultiSelectEnabled && 
        (filter.operator === FilterOperator.IN || filter.operator === FilterOperator.NOT_IN)) {
      // For multi-select operators, pass the array of values
      onFilterChange({
        ...filter,
        value: selectedValues
      });
    }
  }, [selectedValues, filter, onFilterChange, isMultiSelectEnabled]);
  
  // Handle field change
  const handleFieldChange = (fieldId: string) => {
    const field = availableFields.find(f => f.id === fieldId);
    if (!field) return;
    
    // Reset values when field changes
    setSelectedValues([]);
    
    const defaultOperator = getDefaultOperator(field.fieldType);
    
    onFilterChange({
      ...filter,
      field,
      operator: defaultOperator,
      value: defaultOperator === FilterOperator.IN || defaultOperator === FilterOperator.NOT_IN 
        ? [] 
        : getDefaultValue(field.fieldType),
      additionalValue: undefined
    });
  };
  
  // Handle operator change
  const handleOperatorChange = (operator: FilterOperator) => {
    // When switching to/from multi-select operators
    if (operator === FilterOperator.IN || operator === FilterOperator.NOT_IN) {
      // Multi-select operators use array values
      onFilterChange({
        ...filter,
        operator,
        value: selectedValues,
        additionalValue: undefined
      });
    } else if (filter.operator === FilterOperator.IN || filter.operator === FilterOperator.NOT_IN) {
      // Switching from multi-select to single value
      onFilterChange({
        ...filter,
        operator,
        value: selectedValues.length > 0 ? selectedValues[0] : getDefaultValue(filter.field.fieldType),
        additionalValue: operator === FilterOperator.BETWEEN 
          ? getDefaultValue(filter.field.fieldType) 
          : undefined
      });
    } else {
      // Regular operator change
      onFilterChange({
        ...filter,
        operator,
        additionalValue: operator === FilterOperator.BETWEEN 
          ? filter.value 
          : undefined
      });
    }
  };
  
  // Handle single value change
  const handleValueChange = (value: any) => {
    if (filter.operator === FilterOperator.IN || filter.operator === FilterOperator.NOT_IN) {
      // Do nothing for multi-select operators - handled separately
      return;
    }
    
    onFilterChange({
      ...filter,
      value
    });
  };
  
  // Handle additional value change (for BETWEEN operator)
  const handleAdditionalValueChange = (value: any) => {
    onFilterChange({
      ...filter,
      additionalValue: value
    });
  };
  
  // Handle multi-select value selection
  const handleMultiSelectChange = (value: any, isSelected: boolean) => {
    if (isSelected) {
      // Add value to selection
      setSelectedValues([...selectedValues, value]);
    } else {
      // Remove value from selection
      setSelectedValues(selectedValues.filter(v => v !== value));
    }
  };
  
  // Get default operator based on field type
  const getDefaultOperator = (fieldType: ReportFieldType): FilterOperator => {
    switch (fieldType) {
      case ReportFieldType.TEXT:
        return FilterOperator.CONTAINS;
      case ReportFieldType.NUMBER:
      case ReportFieldType.CURRENCY:
        return FilterOperator.EQUALS;
      case ReportFieldType.DATE:
        return FilterOperator.GREATER_THAN;
      case ReportFieldType.BOOLEAN:
        return FilterOperator.EQUALS;
      case ReportFieldType.ENUM:
        return isMultiSelectEnabled ? FilterOperator.IN : FilterOperator.EQUALS;
      default:
        return FilterOperator.EQUALS;
    }
  };
  
  // Get default value based on field type
  const getDefaultValue = (fieldType: ReportFieldType): any => {
    switch (fieldType) {
      case ReportFieldType.TEXT:
        return '';
      case ReportFieldType.NUMBER:
      case ReportFieldType.CURRENCY:
        return 0;
      case ReportFieldType.DATE:
        return new Date().toISOString().split('T')[0];
      case ReportFieldType.BOOLEAN:
        return true;
      case ReportFieldType.ENUM:
        return '';
      default:
        return '';
    }
  };
  
  // Get available operators for a field type
  const getOperatorsForFieldType = (fieldType: ReportFieldType): FilterOperator[] => {
    const baseOperators = [
      FilterOperator.EQUALS,
      FilterOperator.NOT_EQUALS
    ];
    
    switch (fieldType) {
      case ReportFieldType.TEXT:
        return [
          ...baseOperators,
          FilterOperator.CONTAINS,
          FilterOperator.STARTS_WITH,
          FilterOperator.ENDS_WITH,
        ];
      case ReportFieldType.NUMBER:
      case ReportFieldType.CURRENCY:
        return [
          ...baseOperators,
          FilterOperator.GREATER_THAN,
          FilterOperator.LESS_THAN,
          FilterOperator.BETWEEN,
        ];
      case ReportFieldType.DATE:
        return [
          ...baseOperators,
          FilterOperator.GREATER_THAN,
          FilterOperator.LESS_THAN,
          FilterOperator.BETWEEN,
        ];
      case ReportFieldType.BOOLEAN:
        return [FilterOperator.EQUALS];
      case ReportFieldType.ENUM:
        return isMultiSelectEnabled 
          ? [...baseOperators, FilterOperator.IN, FilterOperator.NOT_IN]
          : baseOperators;
      default:
        return baseOperators;
    }
  };
  
  // Render operator display name
  const getOperatorDisplayName = (operator: FilterOperator): string => {
    switch (operator) {
      case FilterOperator.EQUALS: return 'Equals';
      case FilterOperator.NOT_EQUALS: return 'Not Equals';
      case FilterOperator.GREATER_THAN: return 'Greater Than';
      case FilterOperator.LESS_THAN: return 'Less Than';
      case FilterOperator.CONTAINS: return 'Contains';
      case FilterOperator.STARTS_WITH: return 'Starts With';
      case FilterOperator.ENDS_WITH: return 'Ends With';
      case FilterOperator.BETWEEN: return 'Between';
      case FilterOperator.IN: return 'Is Any Of';
      case FilterOperator.NOT_IN: return 'Is Not Any Of';
      default: return operator;
    }
  };
  
  // Get potential values for a field (for multi-select)
  const getPotentialValues = (field: ReportField): { label: string; value: any }[] => {
    // In a real application, these would come from the API or be passed in as props
    switch (field.fieldType) {
      case ReportFieldType.ENUM:
        if (field.id.includes('type')) {
          return [
            { label: 'Income', value: 'INCOME' },
            { label: 'Expense', value: 'EXPENSE' }
          ];
        } else if (field.id.includes('status')) {
          return [
            { label: 'Pending', value: 'PENDING' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Failed', value: 'FAILED' },
            { label: 'Cancelled', value: 'CANCELLED' }
          ];
        } else if (field.id.includes('category')) {
          return [
            { label: 'Grant', value: 'GRANT' },
            { label: 'Donation', value: 'DONATION' },
            { label: 'Repayment', value: 'REPAYMENT' },
            { label: 'Operational', value: 'OPERATIONAL' },
            { label: 'Service Provider', value: 'SERVICE_PROVIDER' },
            { label: 'Other', value: 'OTHER' }
          ];
        } else {
          return [
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Inactive', value: 'INACTIVE' }
          ];
        }
      default:
        return [];
    }
  };
  
  // Render the value input based on field type and operator
  const renderValueInput = () => {
    const { field, operator, value } = filter;
    
    // For multi-select operators
    if ((operator === FilterOperator.IN || operator === FilterOperator.NOT_IN) && 
        isMultiSelectEnabled) {
      
      const options = getPotentialValues(field);
      
      return (
        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-md">
          {options.map(option => (
            <div key={option.value} className="flex items-center">
              <input
                type="checkbox"
                id={`${filter.id}-${option.value}`}
                checked={selectedValues.includes(option.value)}
                onChange={(e) => handleMultiSelectChange(option.value, e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label 
                htmlFor={`${filter.id}-${option.value}`}
                className="ml-2 block text-sm text-gray-700"
              >
                {option.label}
              </label>
            </div>
          ))}
          {options.length === 0 && (
            <div className="text-sm text-gray-500 italic">No options available</div>
          )}
        </div>
      );
    }
    
    // Standard value inputs based on field type
    switch (field.fieldType) {
      case ReportFieldType.TEXT:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        );
        
      case ReportFieldType.NUMBER:
      case ReportFieldType.CURRENCY:
        return (
          <div className="flex space-x-2">
            <input
              type="number"
              value={value}
              onChange={(e) => handleValueChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            
            {operator === FilterOperator.BETWEEN && (
              <input
                type="number"
                value={filter.additionalValue || 0}
                onChange={(e) => handleAdditionalValueChange(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Upper value"
              />
            )}
          </div>
        );
        
      case ReportFieldType.DATE:
        return (
          <div className="flex space-x-2">
            <input
              type="date"
              value={value || ''}
              onChange={(e) => handleValueChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            
            {operator === FilterOperator.BETWEEN && (
              <input
                type="date"
                value={filter.additionalValue || ''}
                onChange={(e) => handleAdditionalValueChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="End date"
              />
            )}
          </div>
        );
        
      case ReportFieldType.BOOLEAN:
        return (
          <select
            value={value ? 'true' : 'false'}
            onChange={(e) => handleValueChange(e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
        
      case ReportFieldType.ENUM:
        const options = getPotentialValues(field);
        return (
          <select
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a value</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        );
    }
  };
  
  return (
    <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
      <div className="flex justify-between items-start mb-3">
        <div className="font-medium text-sm text-gray-700">
          Filter: {filter.field.name}
        </div>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Remove
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Field selector */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Field
          </label>
          <select
            value={filter.field.id}
            onChange={(e) => handleFieldChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {availableFields.map(field => (
              <option key={field.id} value={field.id}>
                {field.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Operator selector */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Condition
          </label>
          <select
            value={filter.operator}
            onChange={(e) => handleOperatorChange(e.target.value as FilterOperator)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {getOperatorsForFieldType(filter.field.fieldType).map(op => (
              <option key={op} value={op}>
                {getOperatorDisplayName(op)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Value input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Value
          </label>
          {renderValueInput()}
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilterItem;
