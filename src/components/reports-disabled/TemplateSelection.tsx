import React, { useState, useEffect } from 'react';
import { ReportTemplate, getAllTemplates, duplicateTemplate, deleteTemplate } from '@/utils/reports';
import TemplateCard from './TemplateCard';

interface TemplateSelectionProps {
  onSelectTemplate: (template: ReportTemplate) => void;
  selectedTemplateId?: string;
}

/**
 * Component for selecting a report template
 */
const TemplateSelection: React.FC<TemplateSelectionProps> = ({ 
  onSelectTemplate, 
  selectedTemplateId 
}) => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const allTemplates = await getAllTemplates();
        setTemplates(allTemplates);
      } catch (err) {
        console.error('Error loading templates:', err);
        setError('Failed to load report templates');
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplates();
  }, []);
  
  // Handle template duplication
  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;
      
      const newName = `${template.name} (Copy)`;
      const newTemplate = await duplicateTemplate(templateId, newName);
      
      // Update templates list with the new template
      setTemplates(prev => [...prev, newTemplate]);
      
      // Select the new template
      onSelectTemplate(newTemplate);
    } catch (err) {
      console.error('Error duplicating template:', err);
      setError('Failed to duplicate template');
    }
  };
  
  // Handle template deletion
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
      
      // Remove deleted template from list
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      
      // If the deleted template was selected, clear selection
      if (selectedTemplateId === templateId) {
        onSelectTemplate(templates[0]);
      }
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Failed to delete template');
    }
  };
  
  // Filter templates based on search term
  const filteredTemplates = templates.filter(template => {
    const searchString = searchTerm.toLowerCase();
    return (
      template.name.toLowerCase().includes(searchString) ||
      template.description.toLowerCase().includes(searchString) ||
      template.primaryEntityType.toLowerCase().includes(searchString)
    );
  });
  
  // Organize templates by system vs custom
  const systemTemplates = filteredTemplates.filter(t => t.isSystem);
  const customTemplates = filteredTemplates.filter(t => !t.isSystem);
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Select Report Template</h2>
      
      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {loading ? (
        <div className="py-8 flex justify-center">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="space-y-6">
          {/* System templates section */}
          {systemTemplates.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">System Templates</h3>
              <div className="space-y-2">
                {systemTemplates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    selected={template.id === selectedTemplateId}
                    onSelect={() => onSelectTemplate(template)}
                    onDuplicate={() => handleDuplicateTemplate(template.id)}
                    onDelete={() => handleDeleteTemplate(template.id)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Custom templates section */}
          {customTemplates.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Custom Templates</h3>
              <div className="space-y-2">
                {customTemplates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    selected={template.id === selectedTemplateId}
                    onSelect={() => onSelectTemplate(template)}
                    onDuplicate={() => handleDuplicateTemplate(template.id)}
                    onDelete={() => handleDeleteTemplate(template.id)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* No results */}
          {filteredTemplates.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              <p>No templates found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateSelection;
