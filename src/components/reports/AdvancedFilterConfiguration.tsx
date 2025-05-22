import React, { useState, useEffect } from 'react';
import { 
  ReportField, 
  ReportFilter, 
  FilterOperator, 
  ReportFieldType,
  FilterConditionGroup,
  FilterLogicalOperator,
  FilterPreset
} from '@/utils/reports/reportTypes';
import AdvancedFilterItem from './AdvancedFilterItem';
import { FilterConditionGroupBuilder } from './FilterConditionGroupBuilder';
import {
  saveFilterPreset,
  getFilterPresetsByEntityType,
  deleteFilterPreset
} from '@/utils/reports/filterPresetManager';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Stack,
  Input,
  useToast
} from '@chakra-ui/react';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/tabs';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/modal';

interface AdvancedFilterConfigurationProps {
  availableFields: ReportField[];
  filters?: ReportFilter[];
  filterGroups?: FilterConditionGroup[];
  onFiltersChange?: (filters: ReportFilter[]) => void;
  onFilterGroupsChange?: (filterGroups: FilterConditionGroup[]) => void;
  entityType?: string;
}

/**
 * Advanced filter configuration component with support for multi-select,
 * nested filter groups, and saved presets
 */
const AdvancedFilterConfiguration: React.FC<AdvancedFilterConfigurationProps> = ({
  availableFields,
  filters = [],
  filterGroups = [],
  onFiltersChange,
  onFilterGroupsChange,
  entityType = 'transaction'
}) => {
  const [currentFilters, setCurrentFilters] = useState<ReportFilter[]>(filters);
  const [currentFilterGroups, setCurrentFilterGroups] = useState<FilterConditionGroup[]>(
    filterGroups.length > 0 
      ? filterGroups 
      : [{
          id: `group-${Date.now()}`,
          logicalOperator: FilterLogicalOperator.AND,
          conditions: []
        }]
  );
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const toast = useToast();
  
  // Update parent when filters change
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(currentFilters);
    }
  }, [currentFilters, onFiltersChange]);
  
  // Update parent when filter groups change
  useEffect(() => {
    if (onFilterGroupsChange) {
      onFilterGroupsChange(currentFilterGroups);
    }
  }, [currentFilterGroups, onFilterGroupsChange]);
  
  // Add a new filter group
  const addFilterGroup = () => {
    const newGroup: FilterConditionGroup = {
      id: `group-${Date.now()}`,
      logicalOperator: FilterLogicalOperator.AND,
      conditions: []
    };
    
    setCurrentFilterGroups([...currentFilterGroups, newGroup]);
  };
  
  // Remove a filter group
  const removeFilterGroup = (groupId: string) => {
    if (currentFilterGroups.length <= 1) {
      // Don't remove the last group
      toast({
        title: "Cannot remove",
        description: "At least one filter group is required",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    setCurrentFilterGroups(currentFilterGroups.filter(g => g.id !== groupId));
  };
  
  // Update a filter group
  const updateFilterGroup = (updatedGroup: FilterConditionGroup) => {
    setCurrentFilterGroups(currentFilterGroups.map(group => 
      group.id === updatedGroup.id ? updatedGroup : group
    ));
  };
  
  // Add a basic filter (legacy support)
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
  
  // Update a filter
  const updateFilter = (updatedFilter: ReportFilter) => {
    setCurrentFilters(currentFilters.map(filter => 
      filter.id === updatedFilter.id ? updatedFilter : filter
    ));
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    if (activeTab === 0) {
      setCurrentFilters([]);
    } else {
      // Reset to a single empty group
      setCurrentFilterGroups([
        {
          id: `group-${Date.now()}`,
          logicalOperator: FilterLogicalOperator.AND,
          conditions: []
        }
      ]);
    }
  };
  
  // Save current configuration as a preset
  const saveAsPreset = () => {
    if (!newPresetName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your preset",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    try {
      const preset: Omit<FilterPreset, 'id'> = {
        name: newPresetName,
        description: newPresetDescription || undefined,
        entityType,
        filterGroup: currentFilterGroups[0], // Save the first group
        createdAt: new Date().toISOString()
      };
      
      saveFilterPreset(preset);
      setNewPresetName('');
      setNewPresetDescription('');
      onClose();
      
      toast({
        title: "Preset saved",
        description: `Filter preset "${newPresetName}" has been saved`,
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preset",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
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

  return (
    <Box bg="white" borderWidth="1px" borderRadius="md" p={4} mb={4} shadow="sm">
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Advanced Filters</Heading>
        <Flex>
          <Button size="sm" colorScheme="blue" onClick={onOpen} mr={2}>
            Save as Preset
          </Button>
          <Button size="sm" colorScheme="red" variant="outline" onClick={clearAllFilters}>
            Clear All
          </Button>
        </Flex>
      </Flex>

      <Tabs variant="enclosed" onChange={setActiveTab} index={activeTab}>
        <TabList>
          <Tab>Simple Filters</Tab>
          <Tab>Advanced Filter Groups</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <Box>
              {currentFilters.length === 0 ? (
                <Box textAlign="center" py={6} color="gray.500">
                  No simple filters configured. Add a filter or switch to Advanced Filter Groups tab.
                </Box>
              ) : (
                <Box mt={3}>
                  {currentFilters.map(filter => (
                    <Box key={filter.id} mb={3}>
                      <AdvancedFilterItem
                        filter={filter}
                        availableFields={availableFields}
                        onFilterChange={updateFilter}
                        onRemove={() => setCurrentFilters(currentFilters.filter(f => f.id !== filter.id))}
                      />
                    </Box>
                  ))}
                </Box>
              )}
              
              <Button onClick={addFilter} size="sm" alignSelf="flex-start">
                + Add Filter
              </Button>
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box>
              {currentFilterGroups.map((group, index) => (
                <Box key={group.id} mb={4}>
                  <FilterConditionGroupBuilder
                    group={group}
                    onChange={(updatedGroup) => updateFilterGroup(updatedGroup)}
                    onRemove={currentFilterGroups.length > 1 ? () => removeFilterGroup(group.id) : undefined}
                    availableFields={availableFields}
                    entityType={entityType}
                  />
                </Box>
              ))}
              
              <Button onClick={addFilterGroup} size="sm" alignSelf="flex-start">
                + Add Filter Group
              </Button>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Save Preset Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Save Filter Preset</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Box>
                <Text mb={1}>Preset Name:</Text>
                <Input 
                  placeholder="Enter a name for this preset"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                />
              </Box>
              
              <Box>
                <Text mb={1}>Description (Optional):</Text>
                <Input 
                  placeholder="Enter a description"
                  value={newPresetDescription}
                  onChange={(e) => setNewPresetDescription(e.target.value)}
                />
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={saveAsPreset}>
              Save Preset
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdvancedFilterConfiguration;
