import React, { useState, useEffect } from 'react';
import { ReportField, ReportAggregation, ReportFieldType } from '@/utils/reports';

interface FieldSelectionProps {
  availableFields: ReportField[];
  selectedFields: ReportField[];
  onFieldsChange: (fields: ReportField[]) => void;
}

/**
 * Component for selecting and configuring fields to include in a report
 */
const FieldSelection: React.FC<FieldSelectionProps> = ({
  availableFields,
  selectedFields,
  onFieldsChange,
}) => {
  const [fields, setFields] = useState<ReportField[]>(selectedFields);
  
  // Update parent when fields change
  useEffect(() => {
    onFieldsChange(fields);
  }, [fields, onFieldsChange]);
  
  // Toggle field inclusion
  const toggleFieldInclusion = (fieldId: string) => {
    setFields(prevFields => 
      prevFields.map(field => 
        field.id === fieldId 
          ? { ...field, includeInReport: !field.includeInReport } 
          : field
      )
    );
  };
  
  // Update field aggregation
  const updateFieldAggregation = (fieldId: string, aggregation: ReportAggregation | undefined) => {
    setFields(prevFields => 
      prevFields.map(field => 
        field.id === fieldId 
          ? { ...field, aggregation } 
          : field
      )
    );
  };
  
  // Check if aggregation is applicable for a field type
  const isAggregationApplicable = (fieldType: ReportFieldType): boolean => {
    return [ReportFieldType.NUMBER, ReportFieldType.CURRENCY].includes(fieldType);
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Select Fields to Include</h2>
      
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Include
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Field Name
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Type
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Aggregation
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {fields.map((field) => (
              <tr key={field.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  <input
                    type="checkbox"
                    checked={field.includeInReport}
                    onChange={() => toggleFieldInclusion(field.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {field.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {field.fieldType}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {isAggregationApplicable(field.fieldType) ? (
                    <select
                      value={field.aggregation || ''}
                      onChange={(e) => updateFieldAggregation(
                        field.id, 
                        e.target.value ? e.target.value as ReportAggregation : undefined
                      )}
                      className="block w-full px-2 py-1 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      disabled={!field.includeInReport}
                    >
                      <option value="">None</option>
                      <option value={ReportAggregation.SUM}>Sum</option>
                      <option value={ReportAggregation.AVERAGE}>Average</option>
                      <option value={ReportAggregation.MIN}>Minimum</option>
                      <option value={ReportAggregation.MAX}>Maximum</option>
                      <option value={ReportAggregation.COUNT}>Count</option>
                    </select>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {fields.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <p>No fields available for this report type.</p>
        </div>
      )}
    </div>
  );
};

export default FieldSelection;
