import { ReportTemplate, ReportField, ReportFilter, ReportSort } from './reportTypes';
import { getPredefinedTemplates } from './predefinedTemplates';

// Local storage key for user templates
const USER_TEMPLATES_KEY = 'yathashakti_report_templates';

/**
 * Retrieves all report templates (system + user defined)
 * @returns Array of report templates
 */
export const getAllTemplates = async (): Promise<ReportTemplate[]> => {
  try {
    // Get system templates
    const systemTemplates = getPredefinedTemplates();
    
    // Get user templates from local storage
    const userTemplates = getUserTemplates();
    
    // Combine and return all templates
    return [...systemTemplates, ...userTemplates];
  } catch (error) {
    console.error('Error retrieving report templates:', error);
    return getPredefinedTemplates(); // Fallback to system templates only
  }
};

/**
 * Retrieves user-defined templates from local storage
 * @returns Array of user-defined templates
 */
export const getUserTemplates = (): ReportTemplate[] => {
  try {
    if (typeof window === 'undefined') return [];
    
    const storedTemplates = localStorage.getItem(USER_TEMPLATES_KEY);
    if (!storedTemplates) return [];
    
    return JSON.parse(storedTemplates);
  } catch (error) {
    console.error('Error retrieving user templates:', error);
    return [];
  }
};

/**
 * Saves a user-defined template
 * @param template The template to save
 * @returns The saved template
 */
export const saveTemplate = async (template: ReportTemplate): Promise<ReportTemplate> => {
  try {
    if (typeof window === 'undefined') 
      throw new Error('Cannot save template: localStorage not available');
    
    // Don't allow modification of system templates
    if (template.isSystem) {
      throw new Error('System templates cannot be modified');
    }
    
    // Generate an ID if not provided
    if (!template.id) {
      template.id = `user-template-${Date.now()}`;
    }
    
    // Set timestamps
    template.updatedAt = new Date();
    if (!template.createdAt) {
      template.createdAt = new Date();
    }
    
    // Get existing templates
    const templates = getUserTemplates();
    
    // Find if template already exists
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      // Update existing template
      templates[existingIndex] = template;
    } else {
      // Add new template
      templates.push(template);
    }
    
    // Save to local storage
    localStorage.setItem(USER_TEMPLATES_KEY, JSON.stringify(templates));
    
    return template;
  } catch (error) {
    console.error('Error saving template:', error);
    throw error;
  }
};

/**
 * Deletes a user-defined template
 * @param templateId ID of the template to delete
 * @returns True if deleted successfully
 */
export const deleteTemplate = async (templateId: string): Promise<boolean> => {
  try {
    if (typeof window === 'undefined')
      throw new Error('Cannot delete template: localStorage not available');
    
    // Get existing templates
    const templates = getUserTemplates();
    
    // Find template to delete
    const templateToDelete = templates.find(t => t.id === templateId);
    
    if (!templateToDelete) {
      throw new Error('Template not found');
    }
    
    // Prevent deletion of system templates
    if (templateToDelete.isSystem) {
      throw new Error('System templates cannot be deleted');
    }
    
    // Filter out the template to delete
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    
    // Save updated templates
    localStorage.setItem(USER_TEMPLATES_KEY, JSON.stringify(updatedTemplates));
    
    return true;
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};

/**
 * Creates a new template based on an existing one
 * @param sourceTemplateId ID of the template to duplicate
 * @param newName Name for the new template
 * @returns The newly created template
 */
export const duplicateTemplate = async (
  sourceTemplateId: string,
  newName: string
): Promise<ReportTemplate> => {
  try {
    // Get all templates
    const allTemplates = await getAllTemplates();
    
    // Find the source template
    const sourceTemplate = allTemplates.find(t => t.id === sourceTemplateId);
    
    if (!sourceTemplate) {
      throw new Error('Source template not found');
    }
    
    // Create a deep copy of the source template
    const newTemplate: ReportTemplate = {
      ...JSON.parse(JSON.stringify(sourceTemplate)),
      id: `user-template-${Date.now()}`,
      name: newName,
      description: `Copy of ${sourceTemplate.name}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      isSystem: false, // User templates are never system templates
    };
    
    // Save the new template
    return await saveTemplate(newTemplate);
  } catch (error) {
    console.error('Error duplicating template:', error);
    throw error;
  }
};
