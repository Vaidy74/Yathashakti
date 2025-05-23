import React, { useState } from 'react';
import { ReportFormat } from '@/utils/reports';

interface ReportExportOptionsProps {
  onConfigChange: (config: {
    name: string;
    format: ReportFormat;
    dateRange?: { startDate: Date; endDate: Date };
    includeCharts: boolean;
  }) => void;
  defaultName?: string;
}

/**
 * Component for configuring report export options
 */
const ReportExportOptions: React.FC<ReportExportOptionsProps> = ({
  onConfigChange,
  defaultName = 'Custom Report',
}) => {
  const [name, setName] = useState(defaultName);
  const [format, setFormat] = useState<ReportFormat>(ReportFormat.PDF);
  const [useDateRange, setUseDateRange] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [includeCharts, setIncludeCharts] = useState(true);

  // Update parent component when config changes
  const handleChange = () => {
    const config = {
      name,
      format,
      includeCharts,
    } as any;

    if (useDateRange && startDate && endDate) {
      config.dateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
    }

    onConfigChange(config);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Export Options</h2>

      <div className="space-y-4">
        {/* Report Name */}
        <div>
          <label htmlFor="report-name" className="block text-sm font-medium text-gray-700 mb-1">
            Report Name
          </label>
          <input
            id="report-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              handleChange();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Report Format */}
        <div>
          <label htmlFor="report-format" className="block text-sm font-medium text-gray-700 mb-1">
            Export Format
          </label>
          <select
            id="report-format"
            value={format}
            onChange={(e) => {
              setFormat(e.target.value as ReportFormat);
              handleChange();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={ReportFormat.PDF}>PDF Document</option>
            <option value={ReportFormat.EXCEL}>Excel Spreadsheet</option>
            <option value={ReportFormat.CSV}>CSV File</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <div className="flex items-center mb-2">
            <input
              id="use-date-range"
              type="checkbox"
              checked={useDateRange}
              onChange={(e) => {
                setUseDateRange(e.target.checked);
                handleChange();
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="use-date-range" className="ml-2 block text-sm font-medium text-gray-700">
              Filter by Date Range
            </label>
          </div>

          {useDateRange && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    handleChange();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    handleChange();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Include Charts (only for PDF format) */}
        {format === ReportFormat.PDF && (
          <div className="flex items-center">
            <input
              id="include-charts"
              type="checkbox"
              checked={includeCharts}
              onChange={(e) => {
                setIncludeCharts(e.target.checked);
                handleChange();
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="include-charts" className="ml-2 block text-sm font-medium text-gray-700">
              Include Charts and Graphs
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportExportOptions;
