import React, { useState, useEffect } from 'react';
import { 
  ReportField, 
  ReportFilter, 
  FilterOperator, 
  FilterConditionGroup, 
  FilterLogicalOperator,
  FilterPreset,
  ReportFieldType
} from '@/utils/reports/reportTypes';
import AdvancedFilterItem from './AdvancedFilterItem';

import { 
  getFilterPresetsByEntityType, 
  saveFilterPreset, 
  deleteFilterPreset, 
  applyFilterPreset 
} from '@/utils/reports/filterPresetManager';

interface FilterConditionGroupBuilderProps {
  availableFields: ReportField[];
  group: FilterConditionGroup;
  onChange: (group: FilterConditionGroup) => void;
  onRemove?: () => void;
  nestingLevel?: number;
  isNested?: boolean;
  entityType?: string;
}

const MAX_NESTING_LEVEL = 2; // Limit nesting to prevent overly complex queries

// Helper functions
const isFilterCondition = (condition: ReportFilter | FilterConditionGroup): condition is ReportFilter => {
  return 'field' in condition;
};

const getDefaultOperator = (fieldType: ReportFieldType): FilterOperator => {
  switch (fieldType) {
    case ReportFieldType.TEXT:
      return FilterOperator.CONTAINS;
    case ReportFieldType.NUMBER:
    case ReportFieldType.CURRENCY:
      return FilterOperator.EQUALS;
    case ReportFieldType.DATE:
      return FilterOperator.BETWEEN;
    case ReportFieldType.BOOLEAN:
      return FilterOperator.EQUALS;
    case ReportFieldType.ENUM:
      return FilterOperator.IN;
    default:
      return FilterOperator.EQUALS;
  }
};

const getDefaultValue = (fieldType: ReportFieldType): any => {
  switch (fieldType) {
    case ReportFieldType.NUMBER:
    case ReportFieldType.CURRENCY:
      return 0;
    case ReportFieldType.DATE:
      return new Date().toISOString();
    case ReportFieldType.BOOLEAN:
      return false;
    case ReportFieldType.ENUM:
      return [];
    default:
      return '';
  }
};

const FilterConditionGroupBuilder: React.FC<FilterConditionGroupBuilderProps> = ({
  availableFields,
  group,
  onChange,
  onRemove,
  nestingLevel = 0,
  isNested = false,
  entityType = 'transaction',
}) => {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // Load presets when component mounts or entityType changes
  useEffect(() => {
    if (entityType) {
      const loadedPresets = getFilterPresetsByEntityType(entityType);
      setPresets(loadedPresets);
    }
  }, [entityType]);

  // Add a new filter to this group
  const addFilter = () => {
    if (!availableFields.length) return;
    
    const field = availableFields[0];
    const newFilter: ReportFilter = {
      id: Math.random().toString(36).substr(2, 9),
      field: field.name,
      operator: getDefaultOperator(field.type),
      value: getDefaultValue(field.type)
    };
    
    onChange({
      ...group,
      conditions: [...group.conditions, newFilter]
    });
  };

  // Add a new nested group
  const addNestedGroup = () => {
    if (nestingLevel >= MAX_NESTING_LEVEL) return;
    
    const newGroup: FilterConditionGroup = {
      id: Math.random().toString(36).substr(2, 9),
      operator: FilterLogicalOperator.AND,
      conditions: []
    };
    
    onChange({
      ...group,
      conditions: [...group.conditions, newGroup]
    });
  };

  // Remove a condition (filter or group)
  const removeCondition = (index: number) => {
    const updatedConditions = [...group.conditions];
    updatedConditions.splice(index, 1);
    onChange({
      ...group,
      conditions: updatedConditions
    });
  };

  // Update a filter condition
  const updateFilter = (updatedFilter: ReportFilter) => {
    const index = group.conditions.findIndex(c => 
      isFilterCondition(c) && c.id === updatedFilter.id
    );
    if (index === -1) return;
    
    const updatedConditions = [...group.conditions];
    updatedConditions[index] = updatedFilter;
    onChange({
      ...group,
      conditions: updatedConditions
    });
  };

  // Update a nested group condition
  const updateNestedGroup = (updatedGroup: FilterConditionGroup) => {
    const index = group.conditions.findIndex(c => 
      !isFilterCondition(c) && c.id === updatedGroup.id
    );
    if (index === -1) return;
    
    const updatedConditions = [...group.conditions];
    updatedConditions[index] = updatedGroup;
    onChange({
      ...group,
      conditions: updatedConditions
    });
  };

  // Change the logical operator (AND/OR)
  const changeLogicalOperator = (newOperator: FilterLogicalOperator) => {
    onChange({
      ...group,
      operator: newOperator
    });
  };

  // Handle save filter preset
  const handleSavePreset = async () => {
    if (!newPresetName.trim()) return;

    const preset: FilterPreset = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPresetName.trim(),
      entityType: entityType,
      conditions: group
    };

    try {
      await saveFilterPreset(preset);
      setPresets([...presets, preset]);
      setNewPresetName('');
      setShowSaveInput(false);
    } catch (error) {
      console.error('Failed to save preset:', error);
    }
  };

  // Handle load filter preset
  const handleLoadPreset = (preset: FilterPreset) => {
    try {
      const loadedGroup = applyFilterPreset(preset);
      onChange(loadedGroup);
    } catch (error) {
      console.error('Failed to load preset:', error);
    }
  };

  // Handle delete filter preset
  const handleDeletePreset = async (presetId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    
    try {
      await deleteFilterPreset(presetId);
      setPresets(presets.filter(p => p.id !== presetId));
    } catch (error) {
      console.error('Failed to delete preset:', error);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      {/* Header with operator toggle and actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Operator toggle */}
          <select
            value={group.operator}
            onChange={(e) => changeLogicalOperator(e.target.value as FilterLogicalOperator)}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value={FilterLogicalOperator.AND}>AND</option>
            <option value={FilterLogicalOperator.OR}>OR</option>
          </select>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded flex items-center hover:bg-blue-700"
              onClick={addFilter}
            >
              <span className="mr-1">➕</span> Add Filter
            </button>
            
            {nestingLevel < MAX_NESTING_LEVEL && (
              <button
                type="button"
                className="px-3 py-1 text-sm bg-green-600 text-white rounded flex items-center hover:bg-green-700"
                onClick={addNestedGroup}
              >
                <span className="mr-1">📦</span> Add Group
              </button>
            )}
          </div>
        </div>

        {/* Presets dropdown */}
        {!isNested && (
          <div className="relative">
            <button
              type="button"
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded flex items-center hover:bg-gray-200"
              onClick={() => setShowPresets(prev => !prev)}
            >
              <span className="mr-1">📋</span> Presets
            </button>

            {showPresets && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border">
                <div className="py-1">
                  {presets.length > 0 ? (
                    presets.map(preset => (
                      <div
                        key={preset.id}
                        className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => { handleLoadPreset(preset); setShowPresets(false); }}
                      >
                        <span>{preset.name}</span>
                        <button
                          type="button"
                          className="ml-2 text-red-500 hover:text-red-700"
                          onClick={(e) => { e.stopPropagation(); handleDeletePreset(preset.id, e); }}
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-400">No saved presets</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Save preset input */}
      {showSaveInput && (
        <div className="flex mb-3">
          <input
            type="text"
            placeholder="Enter preset name"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm mr-2"
          />
          <button
            type="button"
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSavePreset}
          >
            Save
          </button>
          <button
            type="button"
            className="ml-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            onClick={() => setShowSaveInput(false)}
          >
            Cancel
          </button>
        </div>
      )}
      
      {/* If no conditions, show empty state */}
      {group.conditions.length === 0 && (
        <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-md">
          No conditions added yet. Use the buttons above to add filters or groups.
        </div>
      )}
      
      {/* List of conditions (filters and groups) */}
      {group.conditions.length > 0 && (
        <div className="space-y-3">
          {group.conditions.map((condition, index) => (
            <div key={isFilterCondition(condition) ? condition.id : `group-${condition.id}`}>
              {isFilterCondition(condition) ? (
                <AdvancedFilterItem
                  availableFields={availableFields}
                  filter={condition}
                  onFilterChange={updateFilter}
                  onRemove={() => removeCondition(index)}
                  isMultiSelectEnabled={true}
                />
              ) : (
                <FilterConditionGroupBuilder 
                  availableFields={availableFields} 
                  group={condition} 
                  onChange={updateNestedGroup} 
                  onRemove={() => removeCondition(index)} 
                  nestingLevel={nestingLevel + 1} 
                  isNested={true}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterConditionGroupBuilder;
