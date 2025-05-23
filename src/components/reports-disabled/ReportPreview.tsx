import React, { useState, useEffect } from 'react';
import { 
  ReportTemplate, 
  ReportConfig,
  ReportFormat,
  ReportField,
  ReportFilter,
  applyFiltersToData,
  applyFieldSelectionToData
} from '@/utils/reports';

interface ReportPreviewProps {
  template: ReportTemplate;
  config: Partial<ReportConfig>;
  data: any[];
  selectedFields: ReportField[];
  filters: ReportFilter[];
}

/**
 * Component to display a preview of the generated report
 */
const ReportPreview: React.FC<ReportPreviewProps> = ({
  template,
  config,
  data,
  selectedFields,
  filters
}) => {
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleRowCount, setVisibleRowCount] = useState(10);
  
  // Calculate preview data when inputs change
  useEffect(() => {
    try {
      setLoading(true);
      
      // Apply filters to data
      const filteredData = applyFiltersToData(data, filters);
      
      // Apply field selection and aggregation to data
      const processedData = applyFieldSelectionToData(
        filteredData, 
        selectedFields.filter(f => f.includeInReport)
      );
      
      // For preview, limit to a small number of rows
      setPreviewData(processedData.slice(0, 50)); // Store up to 50, but display fewer
      setError(null);
    } catch (err) {
      console.error('Error generating report preview:', err);
      setError('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  }, [data, filters, selectedFields]);
  
  // Show more rows
  const handleShowMore = () => {
    setVisibleRowCount(Math.min(visibleRowCount + 10, previewData.length));
  };
  
  // Get display fields (only those marked for inclusion)
  const displayFields = selectedFields.filter(field => field.includeInReport);
  
  // Determine if there's no data to show
  const noDataToShow = !loading && (!previewData || previewData.length === 0);
  
  // Format a cell value based on field type
  const formatCellValue = (value: any, field: ReportField): string => {
    if (value === undefined || value === null) return '-';
    
    switch (field.fieldType) {
      case 'DATE':
        return new Date(value).toLocaleDateString();
      case 'CURRENCY':
        return new Intl.NumberFormat('en-IN', { 
          style: 'currency', 
          currency: 'INR',
          maximumFractionDigits: 0 
        }).format(value);
      case 'BOOLEAN':
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <p className="text-gray-600">Generating preview...</p>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }
  
  // Show empty state
  if (noDataToShow) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
        <p className="text-gray-500 mb-2">No data available for preview</p>
        <p className="text-sm text-gray-400">
          Try adjusting your filters or select a different template
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="border-b border-gray-200 px-4 py-3">
        <h3 className="text-lg font-medium text-gray-900">
          Preview: {template.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Showing {Math.min(visibleRowCount, previewData.length)} of {previewData.length} records
          {previewData.length >= 50 && ' (limited to 50 records for preview)'}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {displayFields.map(field => (
                <th 
                  key={field.id}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {field.name}
                  {field.aggregation && (
                    <span className="ml-1 text-gray-400">({field.aggregation})</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {previewData.slice(0, visibleRowCount).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {displayFields.map(field => (
                  <td 
                    key={`${rowIndex}-${field.id}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {formatCellValue(row[field.id], field)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {visibleRowCount < previewData.length && (
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="button"
            onClick={handleShowMore}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportPreview;
