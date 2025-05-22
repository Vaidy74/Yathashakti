'use client';

import React, { useState } from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, RotateCcw } from 'lucide-react';

interface TaskProgressTrackerProps {
  taskId: string;
  currentStatus: string;
  onStatusUpdated?: () => void;
}

const TaskProgressTracker: React.FC<TaskProgressTrackerProps> = ({
  taskId,
  currentStatus,
  onStatusUpdated,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: string): Promise<void> => {
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
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task status');
      }

      setSuccessMessage(`Task marked as ${formatStatus(newStatus)}`);
      if (onStatusUpdated) {
        onStatusUpdated();
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task status');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TO_DO':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'IN_PROGRESS':
        return <RotateCcw className="h-4 w-4 text-blue-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TO_DO':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatStatus = (status: string): string => {
    switch (status) {
      case 'TO_DO':
        return 'To Do';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const isActiveStatus = (status: string): boolean => {
    return currentStatus === status;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Progress Tracking</h3>
      
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleStatusChange('TO_DO')}
            disabled={isUpdating || isActiveStatus('TO_DO')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActiveStatus('TO_DO')
                ? 'bg-gray-200 text-gray-900 cursor-default'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Clock className="h-4 w-4 mr-2" />
            To Do
          </button>
          
          <button
            type="button"
            onClick={() => handleStatusChange('IN_PROGRESS')}
            disabled={isUpdating || isActiveStatus('IN_PROGRESS')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActiveStatus('IN_PROGRESS')
                ? 'bg-blue-200 text-blue-900 cursor-default'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            In Progress
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleStatusChange('COMPLETED')}
            disabled={isUpdating || isActiveStatus('COMPLETED')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActiveStatus('COMPLETED')
                ? 'bg-green-200 text-green-900 cursor-default'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed
          </button>
          
          <button
            type="button"
            onClick={() => handleStatusChange('CANCELLED')}
            disabled={isUpdating || isActiveStatus('CANCELLED')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActiveStatus('CANCELLED')
                ? 'bg-red-200 text-red-900 cursor-default'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancelled
          </button>
        </div>
      </div>
      
      {isUpdating && (
        <div className="flex items-center text-gray-500 text-xs">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
          Updating status...
        </div>
      )}
      
      {error && (
        <div className="text-xs text-red-600">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="text-xs text-green-600">
          {successMessage}
        </div>
      )}

      <div className="mt-4">
        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full ${
              currentStatus === 'COMPLETED' 
                ? 'bg-green-500' 
                : currentStatus === 'IN_PROGRESS' 
                  ? 'bg-blue-500' 
                  : currentStatus === 'CANCELLED' 
                    ? 'bg-red-500' 
                    : 'bg-gray-300'
            }`}
            style={{ 
              width: currentStatus === 'COMPLETED' 
                ? '100%' 
                : currentStatus === 'IN_PROGRESS' 
                  ? '50%' 
                  : currentStatus === 'TO_DO' 
                    ? '10%' 
                    : '0%' 
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>To Do</span>
          <span>In Progress</span>
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
};

export default TaskProgressTracker;
