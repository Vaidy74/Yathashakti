import React from 'react';
import { ReportTemplate, ReportEntityType } from '@/utils/reports';

// Icons for different entity types
const entityTypeIcons: Record<ReportEntityType, string> = {
  [ReportEntityType.TRANSACTION]: '💰',
  [ReportEntityType.GRANT]: '🏆',
  [ReportEntityType.GRANTEE]: '👤',
  [ReportEntityType.DONOR]: '🤝',
  [ReportEntityType.SERVICE_PROVIDER]: '🛠️',
  [ReportEntityType.PROGRAM]: '📊',
};

interface TemplateCardProps {
  template: ReportTemplate;
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

/**
 * A card component to display a report template with actions
 */
const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  selected,
  onSelect,
  onDuplicate,
  onDelete,
}) => {
  const entityIcon = entityTypeIcons[template.primaryEntityType] || '📄';
  
  return (
    <div 
      className={`
        border rounded-lg p-4 transition-all cursor-pointer
        ${selected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        }
      `}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{entityIcon}</div>
          <div>
            <h3 className="font-medium text-gray-900">{template.name}</h3>
            <p className="text-sm text-gray-500">{template.description}</p>
          </div>
        </div>
        
        {selected && (
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
              title="Duplicate template"
            >
              Duplicate
            </button>
            
            {!template.isSystem && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 rounded text-red-700"
                title="Delete template"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-3 flex items-center text-xs text-gray-500 space-x-3">
        <span>
          {template.fields.filter(f => f.includeInReport).length} fields
        </span>
        <span>•</span>
        <span>
          {template.filters.length} filters
        </span>
        <span>•</span>
        <span>
          {template.isSystem ? 'System template' : 'Custom template'}
        </span>
      </div>
    </div>
  );
};

export default TemplateCard;
