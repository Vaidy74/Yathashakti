import { FilterConditionGroup, FilterPreset } from './reportTypes';

// Local storage key for filter presets
const FILTER_PRESETS_KEY = 'yathashakti_filter_presets';

/**
 * Gets all saved filter presets
 * @returns Array of filter presets
 */
export const getAllFilterPresets = (): FilterPreset[] => {
  try {
    const presetsString = localStorage.getItem(FILTER_PRESETS_KEY);
    if (!presetsString) return [];
    return JSON.parse(presetsString);
  } catch (error) {
    console.error('Error loading filter presets:', error);
    return [];
  }
};

/**
 * Gets filter presets for a specific entity type
 * @param entityType The entity type to get presets for
 * @returns Array of filter presets for the entity type
 */
export const getFilterPresetsByEntityType = (entityType: string): FilterPreset[] => {
  const allPresets = getAllFilterPresets();
  return allPresets.filter(preset => preset.entityType === entityType);
};

/**
 * Saves a new filter preset
 * @param preset The filter preset to save
 * @returns The saved filter preset with generated ID
 */
export const saveFilterPreset = (preset: Omit<FilterPreset, 'id'>): FilterPreset => {
  const allPresets = getAllFilterPresets();
  
  // Generate a unique ID
  const newId = `preset_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  // Create the preset with ID
  const newPreset: FilterPreset = {
    ...preset,
    id: newId
  };
  
  // Save to storage
  const updatedPresets = [...allPresets, newPreset];
  localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(updatedPresets));
  
  return newPreset;
};

/**
 * Updates an existing filter preset
 * @param preset The filter preset to update
 * @returns True if the preset was updated, false otherwise
 */
export const updateFilterPreset = (preset: FilterPreset): boolean => {
  const allPresets = getAllFilterPresets();
  const presetIndex = allPresets.findIndex(p => p.id === preset.id);
  
  if (presetIndex === -1) return false;
  
  // Update the preset
  allPresets[presetIndex] = preset;
  
  // Save to storage
  localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(allPresets));
  
  return true;
};

/**
 * Deletes a filter preset
 * @param presetId The ID of the preset to delete
 * @returns True if the preset was deleted, false otherwise
 */
export const deleteFilterPreset = (presetId: string): boolean => {
  const allPresets = getAllFilterPresets();
  const updatedPresets = allPresets.filter(p => p.id !== presetId);
  
  if (updatedPresets.length === allPresets.length) {
    return false; // No preset was deleted
  }
  
  // Save updated presets
  localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(updatedPresets));
  
  return true;
};

/**
 * Applies a filter preset to create a filter group
 * @param preset The filter preset to apply
 * @returns The filter condition group from the preset
 */
export const applyFilterPreset = (preset: FilterPreset): FilterConditionGroup => {
  return preset.filterGroup;
};
