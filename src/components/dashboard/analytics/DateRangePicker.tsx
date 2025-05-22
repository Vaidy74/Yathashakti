import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

interface DateRangePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dateRangeOptions = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last7days', label: 'Last 7 days' },
    { id: 'last30days', label: 'Last 30 days' },
    { id: 'thisMonth', label: 'This month' },
    { id: 'lastMonth', label: 'Last month' },
    { id: 'thisQuarter', label: 'This quarter' },
    { id: 'thisYear', label: 'This year' },
    { id: 'custom', label: 'Custom range' }
  ];

  const getDisplayText = () => {
    const option = dateRangeOptions.find(option => option.id === value);
    return option ? option.label : 'Select date range';
  };

  const handleSelectOption = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm flex items-center hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar className="h-4 w-4 mr-2" />
        <span>{getDisplayText()}</span>
        <ChevronDown className="h-4 w-4 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-200">
          <div className="py-1">
            {dateRangeOptions.map((option) => (
              <button
                key={option.id}
                className={`w-full text-left px-4 py-2 text-sm ${
                  option.id === value
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleSelectOption(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {value === 'custom' && (
            <div className="border-t border-gray-200 p-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start date</label>
                  <input
                    type="date"
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End date</label>
                  <input
                    type="date"
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                  />
                </div>
              </div>
              <button
                className="mt-3 w-full bg-blue-600 text-white rounded-md text-sm py-1 hover:bg-blue-700"
              >
                Apply Range
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
