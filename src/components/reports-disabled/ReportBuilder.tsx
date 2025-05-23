import React, { useState, useEffect } from 'react';
import { 
  ReportTemplate, 
  ReportConfig, 
  ReportFormat, 
  ReportField,
  ReportFilter,
  ReportEntityType,
  FilterConditionGroup,
  FilterLogicalOperator,
  FilterPreset,
  getAllTemplates,
  generateReport
} from '@/utils/reports';
import { fetchReportData } from '@/utils/reports/dataFetcher';
import TemplateSelection from './TemplateSelection';
import FieldSelection from './FieldSelection';
import AdvancedFilterConfiguration from './AdvancedFilterConfiguration';
import FilterConditionGroupBuilder from './FilterConditionGroupBuilder';
import ReportExportOptions from './ReportExportOptions';
import ReportPreview from './ReportPreview';

interface ReportBuilderProps {
  initialData?: any[];
  onClose?: () => void;
}

/**
 * Main report builder component that integrates all sub-components
 */
const ReportBuilder: React.FC<ReportBuilderProps> = ({ 
  initialData = [],
  onClose 
}) => {
  // Templates state
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [reportData, setReportData] = useState<any[]>(initialData);
  const [dataLoading, setDataLoading] = useState(false);
  
  // Report configuration state
  const [reportConfig, setReportConfig] = useState<Partial<ReportConfig>>({
    format: ReportFormat.PDF,
    includeCharts: true,
    dateRange: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
      endDate: new Date() // Today
    }
  });
  
  // Selected fields for the report
  const [selectedFields, setSelectedFields] = useState<ReportField[]>([]);
  
  // Report filters
  const [reportFilters, setReportFilters] = useState<ReportFilter[]>([]);
  const [filterGroups, setFilterGroups] = useState<FilterConditionGroup[]>([]);
  const [savedFilterPresets, setSavedFilterPresets] = useState<FilterPreset[]>([]);
  const [useAdvancedFiltering, setUseAdvancedFiltering] = useState(true);
  
  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const allTemplates = await getAllTemplates();
        setTemplates(allTemplates);
        
        // Select the first template by default
        if (allTemplates.length > 0) {
          setSelectedTemplate(allTemplates[0]);
          setSelectedFields(allTemplates[0].fields);
          setReportFilters(allTemplates[0].filters);
          setReportConfig(prev => ({ 
            ...prev, 
            templateId: allTemplates[0].id,
            name: allTemplates[0].name
          }));
        }
      } catch (err) {
        console.error('Error loading report templates:', err);
        setError('Failed to load report templates');
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplates();
  }, []);
  
  // Handle template selection
  const handleSelectTemplate = async (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setSelectedFields(template.fields);
    setReportFilters(template.filters);
    
    // Set filter groups if available, otherwise create a default group
    if (template.filterGroups && template.filterGroups.length > 0) {
      setFilterGroups(template.filterGroups);
    } else {
      // Create a default filter group with existing filters
      const defaultGroup: FilterConditionGroup = {
        id: `group-${Date.now()}`,
        logicalOperator: FilterLogicalOperator.AND,
        conditions: [...template.filters]
      };
      setFilterGroups([defaultGroup]);
    }
    
    // Set saved filter presets if available
    if (template.savedFilterPresets && template.savedFilterPresets.length > 0) {
      setSavedFilterPresets(template.savedFilterPresets);
    }
    
    setReportConfig(prev => ({ 
      ...prev, 
      templateId: template.id,
      name: template.name
    }));
    
    // Fetch data for the selected template entity type
    await fetchDataForTemplate(template);
  };
  
  // Fetch data for a template
  const fetchDataForTemplate = async (template: ReportTemplate) => {
    if (!template.primaryEntityType) return;
    
    try {
      setDataLoading(true);
      const data = await fetchReportData(template.primaryEntityType, {
        dateRange: reportConfig.dateRange
      });
      setReportData(data);
    } catch (err) {
      console.error('Error fetching data for template:', err);
      setError('Failed to fetch data for the selected template');
    } finally {
      setDataLoading(false);
    }
  };
  
  // Handle report generation
  const handleGenerateReport = async () => {
    if (!selectedTemplate || !reportConfig.format) return;
    
    try {
      // Create full report config
      const config: ReportConfig = {
        templateId: selectedTemplate.id,
        name: reportConfig.name || selectedTemplate.name,
        format: reportConfig.format,
        filters: reportFilters,
        dateRange: reportConfig.dateRange,
        includeCharts: reportConfig.includeCharts,
      };
      
      // Update template with latest field and filter selections
      const updatedTemplate: ReportTemplate = {
        ...selectedTemplate,
        fields: selectedFields,
        filters: reportFilters,
        filterGroups: filterGroups,
        savedFilterPresets: savedFilterPresets
      };
      
      // Generate the report
      await generateReport(config, updatedTemplate, reportData);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report');
    }
  };
  
  // Handle export options change
  const handleExportOptionsChange = (options: any) => {
    setReportConfig(prev => ({ ...prev, ...options }));
  };
  
  // Handle filter group change
  const handleFilterGroupChange = (updatedGroup: FilterConditionGroup) => {
    setFilterGroups(filterGroups.map(group =>
      group.id === updatedGroup.id ? updatedGroup : group
    ));
  };
  
  // Add a new filter group
  const addFilterGroup = () => {
    const newGroup: FilterConditionGroup = {
      id: `group-${Date.now()}`,
      logicalOperator: FilterLogicalOperator.AND,
      conditions: []
    };
    
    setFilterGroups([...filterGroups, newGroup]);
  };
  
  // Remove a filter group
  const removeFilterGroup = (groupId: string) => {
    setFilterGroups(filterGroups.filter(group => group.id !== groupId));
  };
  
  // Save filter preset
  const saveFilterPreset = (preset: FilterPreset) => {
    setSavedFilterPresets([...savedFilterPresets, preset]);
  };
  
  // Update data when date range changes
  useEffect(() => {
    if (selectedTemplate && reportConfig.dateRange) {
      fetchDataForTemplate(selectedTemplate);
    }
  }, [reportConfig.dateRange]);
  
  // Show loading state
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
        <p className="text-gray-500">Loading report builder...</p>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p className="font-medium mb-2">Error</p>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white min-h-screen">
      <div className="border-b border-gray-200 px-4 py-4 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Custom Report Builder</h1>
          <p className="mt-1 text-sm text-gray-500">
            Select a template and customize your report
          </p>
        </div>
        <div className="mt-4 flex sm:mt-0 sm:ml-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="mr-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleGenerateReport}
            disabled={!selectedTemplate}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Generate Report
          </button>
        </div>
      </div>
      
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template selection */}
          <div className="lg:col-span-1">
            <TemplateSelection
              onSelectTemplate={handleSelectTemplate}
              selectedTemplateId={selectedTemplate?.id}
            />
            
            {/* Export options */}
            {selectedTemplate && (
              <div className="mt-6">
                <ReportExportOptions
                  onConfigChange={handleExportOptionsChange}
                  defaultName={selectedTemplate.name}
                />
              </div>
            )}
          </div>
          
          {/* Field and filter configuration */}
          {selectedTemplate && (
            <div className="lg:col-span-2 space-y-6">
              <FieldSelection
                availableFields={selectedTemplate.fields}
                selectedFields={selectedFields}
                onFieldsChange={setSelectedFields}
              />
              
              {useAdvancedFiltering ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Advanced Filtering</h3>
                    <button
                      onClick={() => setUseAdvancedFiltering(false)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Switch to Basic Filtering
                    </button>
                  </div>
                  
                  <AdvancedFilterConfiguration
                    availableFields={selectedTemplate.fields}
                    filters={reportFilters}
                    filterGroups={filterGroups}
                    onFiltersChange={setReportFilters}
                    onFilterGroupsChange={setFilterGroups}
                    entityType={selectedTemplate.primaryEntityType}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Basic Filtering</h3>
                    <button
                      onClick={() => setUseAdvancedFiltering(true)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Switch to Advanced Filtering
                    </button>
                  </div>
                  
                  <AdvancedFilterConfiguration
                    availableFields={selectedTemplate.fields}
                    filters={reportFilters}
                    onFiltersChange={setReportFilters}
                  />
                </div>
              )}
              
              {/* Report Preview */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Report Preview</h2>
                {selectedTemplate && (
                  <ReportPreview
                    template={selectedTemplate}
                    config={reportConfig}
                    data={reportData}
                    selectedFields={selectedFields}
                    filters={reportFilters}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;
