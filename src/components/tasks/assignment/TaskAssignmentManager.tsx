'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';
import AssigneeSelect, { UserOption } from './AssigneeSelect';

interface TaskAssignmentManagerProps {
  taskId: string;
  currentAssigneeId: string | null;
  currentAssigneeName?: string | null;
  onAssignmentUpdated?: () => void;
}

const TaskAssignmentManager: React.FC<TaskAssignmentManagerProps> = ({
  taskId,
  currentAssigneeId,
  currentAssigneeName,
  onAssignmentUpdated,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAssigneeChange = async (newAssigneeId: string | null): Promise<void> => {
    try {
      setIsUpdating(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assigneeId: newAssigneeId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update assignee');
      }

      setSuccessMessage('Task assigned successfully');
      if (onAssignmentUpdated) {
        onAssignmentUpdated();
      }
    } catch (err) {
      console.error('Error updating assignee:', err);
      setError(err instanceof Error ? err.message : 'Failed to update assignee');
    } finally {
      setIsUpdating(false);
      
      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Assignee</h3>
        <div className="flex items-center">
          <AssigneeSelect
            taskId={taskId}
            currentAssigneeId={currentAssigneeId}
            onAssigneeChange={handleAssigneeChange}
          />
          
          {isUpdating && (
            <div className="ml-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-2 text-xs text-red-600">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mt-2 text-xs text-green-600">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskAssignmentManager;
