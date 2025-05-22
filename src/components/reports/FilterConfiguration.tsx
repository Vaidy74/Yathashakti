import React, { useState, useEffect } from 'react';
import { 
  ReportField, 
  ReportFilter, 
  FilterOperator, 
  ReportFieldType 
} from '@/utils/reports';

interface FilterConfigurationProps {
  availableFields: ReportField[];
  filters: ReportFilter[];
  onFiltersChange: (filters: ReportFilter[]) => void;
}

/**
 * Component for configuring report filters
 */
const FilterConfiguration: React.FC<FilterConfigurationProps> = ({
  availableFields,
  filters,
  onFiltersChange,
}) => {
  const [currentFilters, setCurrentFilters] = useState<ReportFilter[]>(filters);
  
  // Update parent when filters change
  useEffect(() => {
    onFiltersChange(currentFilters);
  }, [currentFilters, onFiltersChange]);
  
  // Add a new filter
  const addFilter = () => {
    // Default to first available field if exists
    const defaultField = availableFields.length > 0 ? availableFields[0] : null;
    
    if (!defaultField) return; // No fields available
    
    const newFilter: ReportFilter = {
      id: `filter-${Date.now()}`,
      field: defaultField,
      operator: getDefaultOperator(defaultField.fieldType),
      value: getDefaultValue(defaultField.fieldType),
    };
    
    setCurrentFilters([...currentFilters, newFilter]);
  };
  
  // Remove a filter
  const removeFilter = (filterId: string) => {
    setCurrentFilters(currentFilters.filter(f => f.id !== filterId));
  };
  
  // Update a filter field
  const updateFilterField = (filterId: string, fieldId: string) => {
    const field = availableFields.find(f => f.id === fieldId);
    if (!field) return;
    
    setCurrentFilters(currentFilters.map(filter => {
      if (filter.id === filterId) {
        return {
          ...filter,
          field,
          operator: getDefaultOperator(field.fieldType),
          value: getDefaultValue(field.fieldType),
        };
      }
      return filter;
    }));
  };
  
  // Update a filter operator
  const updateFilterOperator = (filterId: string, operator: FilterOperator) => {
    setCurrentFilters(currentFilters.map(filter => {
      if (filter.id === filterId) {
        const updatedFilter = { ...filter, operator };
        
        // For BETWEEN operator, add additional value
        if (operator === FilterOperator.BETWEEN) {
          updatedFilter.additionalValue = filter.value;
        } else {
          delete updatedFilter.additionalValue;
        }
        
        return updatedFilter;
      }
      return filter;
    }));
  };
  
  // Update a filter value
  const updateFilterValue = (filterId: string, value: any) => {
    setCurrentFilters(currentFilters.map(filter => {
      if (filter.id === filterId) {
        return { ...filter, value };
      }
      return filter;
    }));
  };
  
  // Update additional value (for BETWEEN operator)
  const updateFilterAdditionalValue = (filterId: string, value: any) => {
    setCurrentFilters(currentFilters.map(filter => {
      if (filter.id === filterId) {
        return { ...filter, additionalValue: value };
      }
      return filter;
    }));
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
        return FilterOperator.EQUALS;
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
    switch (fieldType) {
      case ReportFieldType.TEXT:
        return [
          FilterOperator.EQUALS,
          FilterOperator.NOT_EQUALS,
          FilterOperator.CONTAINS,
          FilterOperator.STARTS_WITH,
          FilterOperator.ENDS_WITH,
        ];
      case ReportFieldType.NUMBER:
      case ReportFieldType.CURRENCY:
        return [
          FilterOperator.EQUALS,
          FilterOperator.NOT_EQUALS,
          FilterOperator.GREATER_THAN,
          FilterOperator.LESS_THAN,
          FilterOperator.BETWEEN,
        ];
      case ReportFieldType.DATE:
        return [
          FilterOperator.EQUALS,
          FilterOperator.NOT_EQUALS,
          FilterOperator.GREATER_THAN,
          FilterOperator.LESS_THAN,
          FilterOperator.BETWEEN,
        ];
      case ReportFieldType.BOOLEAN:
        return [
          FilterOperator.EQUALS,
        ];
      case ReportFieldType.ENUM:
        return [
          FilterOperator.EQUALS,
          FilterOperator.NOT_EQUALS,
        ];
      default:
        return [FilterOperator.EQUALS];
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
      case FilterOperator.IN: return 'In List';
      default: return operator;
    }
  };
  
  // Render the value input based on field type
  const renderValueInput = (filter: ReportFilter) => {
    const { field, operator, value } = filter;
    
    switch (field.fieldType) {
      case ReportFieldType.TEXT:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateFilterValue(filter.id, e.target.value)}
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
              onChange={(e) => updateFilterValue(filter.id, parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            
            {operator === FilterOperator.BETWEEN && (
              <input
                type="number"
                value={filter.additionalValue || 0}
                onChange={(e) => updateFilterAdditionalValue(filter.id, parseFloat(e.target.value) || 0)}
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
              onChange={(e) => updateFilterValue(filter.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            
            {operator === FilterOperator.BETWEEN && (
              <input
                type="date"
                value={filter.additionalValue || ''}
                onChange={(e) => updateFilterAdditionalValue(filter.id, e.target.value)}
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
            onChange={(e) => updateFilterValue(filter.id, e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
        
      case ReportFieldType.ENUM:
        // In a real app, you would get enum values from the backend
        // For this example, we'll use a generic dropdown
        return (
          <select
            value={value}
            onChange={(e) => updateFilterValue(filter.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a value</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>
        );
        
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateFilterValue(filter.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        );
    }
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
        <button
          onClick={addFilter}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Add Filter
        </button>
      </div>
      
      {currentFilters.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <p>No filters configured. Add a filter to refine your report data.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentFilters.map(filter => (
            <div key={filter.id} className="p-3 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div className="font-medium text-sm text-gray-700">
                  Filter: {filter.field.name}
                </div>
                <button
                  onClick={() => removeFilter(filter.id)}
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
                    onChange={(e) => updateFilterField(filter.id, e.target.value)}
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
                    onChange={(e) => updateFilterOperator(filter.id, e.target.value as FilterOperator)}
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
                  {renderValueInput(filter)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterConfiguration;
