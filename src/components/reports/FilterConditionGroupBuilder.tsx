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
import { AdvancedFilterItem } from './AdvancedFilterItem';
import { 
  Button, 
  Select, 
  Box, 
  Flex, 
  Text, 
  IconButton, 
  Divider, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  Input, 
  useToast,
  Stack
} from '@chakra-ui/react';
import { 
  AddIcon, 
  DeleteIcon, 
  ChevronDownIcon 
} from '@chakra-ui/icons';
import { 
  getAllFilterPresets, 
  getFilterPresetsByEntityType, 
  saveFilterPreset, 
  updateFilterPreset, 
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

/**
 * A component for building nested filter condition groups
 * Allows for creating complex filter conditions with AND/OR logic
 * and saving/loading filter presets
 */
 * Component for building nested filter condition groups with logical operators
 */
export const FilterConditionGroupBuilder: React.FC<FilterConditionGroupBuilderProps> = ({
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
  const toast = useToast();
  const MAX_NESTING_LEVEL = 2; // Limit nesting to prevent overly complex queries

  // Load presets when component mounts or entityType changes
  useEffect(() => {
    if (entityType) {
      const loadedPresets = getFilterPresetsByEntityType(entityType);
      setPresets(loadedPresets);
    }
  }, [entityType]);
  
  // Helper to check if a condition is a filter (not a group)
  const isFilterCondition = (condition: ReportFilter | FilterConditionGroup): condition is ReportFilter => {
    return 'field' in condition;
  };
  
  // Helper to get default operator based on field type
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
  
  // Helper to get default value based on field type
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

  const MAX_NESTING_LEVEL = 2; // Limit nesting to prevent overly complex queries

  // Add a new filter to this group
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

    onChange({
      ...group,
      conditions: [...group.conditions, newFilter]
    });
  };

  // Add a new nested group
  const addNestedGroup = () => {
    if (nestingLevel >= MAX_NESTING_LEVEL) return; // Prevent excessive nesting

    const newGroup: FilterConditionGroup = {
      id: `group-${Date.now()}`,
      logicalOperator: FilterLogicalOperator.AND,
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
    onChange({
      ...group,
      conditions: group.conditions.map(condition => 
        isFilterCondition(condition) && condition.id === updatedFilter.id 
          ? updatedFilter 
          : condition
      )
    });
  };

  // Update a nested group condition
  const updateNestedGroup = (updatedGroup: FilterConditionGroup) => {
    onChange({
      ...group,
      conditions: group.conditions.map(condition => 
        !isFilterCondition(condition) && condition.id === updatedGroup.id 
          ? updatedGroup 
          : condition
      )
    });
  };

  // Change the logical operator (AND/OR)
  const changeLogicalOperator = (newOperator: FilterLogicalOperator) => {
    onChange({
      ...group,
      logicalOperator: newOperator
    });
  };

  // Helper to check if a condition is a filter (not a group)
  const isFilterCondition = (condition: ReportFilter | FilterConditionGroup): condition is ReportFilter => {
    return 'field' in condition;
  };

  // Helper to get default operator based on field type
  const getDefaultOperator = (fieldType: string): FilterOperator => {
    switch (fieldType) {
      case 'TEXT':
        return FilterOperator.CONTAINS;
      case 'NUMBER':
      case 'CURRENCY':
        return FilterOperator.EQUALS;
      case 'DATE':
        return FilterOperator.GREATER_THAN;
      case 'BOOLEAN':
        return FilterOperator.EQUALS;
      case 'ENUM':
        return FilterOperator.IN;
      default:
        return FilterOperator.EQUALS;
    }
  };

  // Helper to get default value based on field type
  const getDefaultValue = (fieldType: string): any => {
    switch (fieldType) {
      case 'TEXT':
        return '';
      case 'NUMBER':
      case 'CURRENCY':
        return 0;
      case 'DATE':
        return new Date().toISOString().split('T')[0];
      case 'BOOLEAN':
        return true;
      case 'ENUM':
        return [];
      default:
        return '';
    }
  };

  // Handle save filter preset
  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for your filter preset',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const preset: Omit<FilterPreset, 'id'> = {
        name: newPresetName,
        entityType,
        filterGroup: group,
        createdAt: new Date().toISOString(),
      };

      const savedPreset = saveFilterPreset(preset);
      setPresets([...presets, savedPreset]);
      setNewPresetName('');
      setShowSaveInput(false);

      toast({
        title: 'Preset saved',
        description: 'Your filter preset has been saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preset',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle load filter preset
  const handleLoadPreset = (preset: FilterPreset) => {
    const filterGroup = applyFilterPreset(preset);
    onChange(filterGroup);

    toast({
      title: 'Preset loaded',
      description: `Applied filter preset: ${preset.name}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle delete filter preset
  const handleDeletePreset = (presetId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent the click from triggering parent handlers
    event.stopPropagation();

    try {
      const deleted = deleteFilterPreset(presetId);
      if (deleted) {
        setPresets(presets.filter(p => p.id !== presetId));
        toast({
          title: 'Preset deleted',
          description: 'Your filter preset has been deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete preset',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      p={3}
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      mb={3}
      bg={isNested ? 'gray.50' : 'white'}
    >
      <Flex justify="space-between" align="center" mb={3}>
        <Flex align="center">
          <Text fontWeight="medium" mr={2}>
            {isNested ? 'Nested Condition Group' : 'Filter Conditions'}
          </Text>
          <Select
            value={group.logicalOperator}
            onChange={(e) => {
              onChange({
                ...group,
                logicalOperator: e.target.value as FilterLogicalOperator,
              });
            }}
            size="sm"
            width="100px"
          >
            <option value={FilterLogicalOperator.AND}>AND</option>
            <option value={FilterLogicalOperator.OR}>OR</option>
          </Select>
        </Flex>
        <Flex>
          {!isNested && (
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" mr={2}>
                Presets
              </MenuButton>
              <MenuList>
                {presets.length > 0 ? (
                  presets.map((preset) => (
                    <MenuItem key={preset.id} onClick={() => handleLoadPreset(preset)}>
                      {preset.name}
                      <IconButton
                        aria-label="Delete preset"
                        icon={<DeleteIcon />}
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        ml={2}
                        onClick={(e) => handleDeletePreset(preset.id, e)}
                      />
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem isDisabled>No saved presets</MenuItem>
                )}
              </MenuList>
            </Menu>
          )}
          
          {!isNested && !showSaveInput && (
            <Button size="sm" leftIcon={<SaveIcon />} onClick={() => setShowSaveInput(true)}>
              Save
            </Button>
          )}
          
          {onRemove && (
            <IconButton
              aria-label="Remove group"
              icon={<DeleteIcon />}
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={onRemove}
              ml={2}
            />
          )}
        </Flex>
      </Flex>
      
      {showSaveInput && (
        <Flex mb={3}>
          <Input
            placeholder="Enter preset name"
            value={newPresetName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPresetName(e.target.value)}
            size="sm"
            mr={2}
          />
          <Button size="sm" colorScheme="blue" onClick={handleSavePreset}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowSaveInput(false)} ml={2}>
              ) : (
                <MenuItem isDisabled>No saved presets</MenuItem>
              )}
            </MenuList>
          </Menu>
        )}
        
        {!isNested && !showSaveInput && (
          <Button size="sm" leftIcon={<SaveIcon />} onClick={() => setShowSaveInput(true)}>
            Save
          </Button>
        )}
        
        {onRemove && (
          <IconButton
            aria-label="Remove group"
            icon={<DeleteIcon />}
            size="sm"
            colorScheme="red"
            variant="ghost"
            onClick={onRemove}
            ml={2}
          />
        )}
      </Flex>
    </Flex>
    
    {showSaveInput && (
      <Flex mb={3}>
        <Input
          placeholder="Enter preset name"
          value={newPresetName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPresetName(e.target.value)}
          size="sm"
          mr={2}
        />
        <Button size="sm" colorScheme="blue" onClick={handleSavePreset}>
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowSaveInput(false)} ml={2}>
          Cancel
        </Button>
      </Flex>
    )}
    
    {/* If no conditions, show empty state */}
    {group.conditions.length === 0 && (
      <Box p={4} textAlign="center" color="gray.500" bg="gray.50" borderRadius="md">
        No conditions added yet. Use the buttons above to add filters or groups.
      </Box>
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
  </Box>
);
};

export default FilterConditionGroupBuilder;
