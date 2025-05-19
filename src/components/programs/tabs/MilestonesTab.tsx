"use client";

import React, { useState } from 'react';
import { Trash2, Plus, Calendar } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
}

interface MilestonesTabProps {
  initialMilestones?: Milestone[];
  readOnly?: boolean;
}

export default function MilestonesTab({ initialMilestones = [], readOnly = false }: MilestonesTabProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones.length > 0 ? initialMilestones : [
    { 
      id: '1', 
      title: '', 
      description: '', 
      dueDate: '', 
      status: 'pending' 
    }
  ]);
  
  // Add a new milestone
  const addMilestone = () => {
    const newId = (milestones.length + 1).toString();
    setMilestones([
      ...milestones,
      { 
        id: newId, 
        title: '', 
        description: '', 
        dueDate: '', 
        status: 'pending' 
      }
    ]);
  };
  
  // Remove a milestone
  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(milestone => milestone.id !== id));
  };
  
  // Update milestone data
  const updateMilestone = (id: string, field: keyof Milestone, value: string) => {
    setMilestones(milestones.map(milestone => 
      milestone.id === id ? { ...milestone, [field]: value } : milestone
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Program Milestones</h2>
        {!readOnly && (
          <button
            type="button"
            onClick={addMilestone}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
          </button>
        )}
      </div>

      {milestones.length === 0 && (
        <div className="bg-gray-50 p-4 text-center rounded-md">
          <p className="text-gray-500">No milestones have been added yet.</p>
        </div>
      )}

      {milestones.map((milestone, index) => (
        <div
          key={milestone.id}
          className="bg-white shadow-sm rounded-lg border border-gray-200 p-4"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-medium text-gray-900">Milestone {index + 1}</h3>
            {!readOnly && (
              <button
                type="button"
                onClick={() => removeMilestone(milestone.id)}
                className="text-red-500 hover:text-red-700"
                disabled={milestones.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor={`milestone-title-${milestone.id}`} className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id={`milestone-title-${milestone.id}`}
                value={milestone.title}
                onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Milestone title"
                disabled={readOnly}
              />
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor={`milestone-desc-${milestone.id}`} className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id={`milestone-desc-${milestone.id}`}
                value={milestone.description}
                onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                rows={2}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Describe the milestone requirements"
                disabled={readOnly}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Due Date */}
              <div>
                <label htmlFor={`milestone-date-${milestone.id}`} className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id={`milestone-date-${milestone.id}`}
                    value={milestone.dueDate}
                    onChange={(e) => updateMilestone(milestone.id, 'dueDate', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    disabled={readOnly}
                  />
                </div>
              </div>
              
              {/* Status */}
              <div>
                <label htmlFor={`milestone-status-${milestone.id}`} className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id={`milestone-status-${milestone.id}`}
                  value={milestone.status}
                  onChange={(e) => updateMilestone(milestone.id, 'status', e.target.value as 'pending' | 'completed' | 'overdue')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={readOnly}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
