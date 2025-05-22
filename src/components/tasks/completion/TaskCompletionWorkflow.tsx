'use client';

import React, { useState } from 'react';
import { CheckCircle, AlertCircle, ClipboardCheck, FileCheck, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCompletionWorkflowProps {
  taskId: string;
  currentStatus: string;
  dueDate: string | Date | null;
  onTaskCompleted?: () => void;
}

const TaskCompletionWorkflow: React.FC<TaskCompletionWorkflowProps> = ({
  taskId,
  currentStatus,
  dueDate,
  onTaskCompleted,
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionDate, setCompletionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isTaskCompleted = currentStatus === 'COMPLETED';
  const isTaskCancelled = currentStatus === 'CANCELLED';
  const canComplete = !isTaskCompleted && !isTaskCancelled;

  const handleShowCompletionForm = () => {
    setShowCompletionForm(true);
  };

  const handleCancelCompletion = () => {
    setShowCompletionForm(false);
    setCompletionNotes('');
    setCompletionDate(new Date().toISOString().split('T')[0]);
  };

  const handleTaskCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsCompleting(true);
      setError(null);
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          completedAt: new Date(completionDate).toISOString(),
          completionNotes: completionNotes.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete task');
      }

      setSuccessMessage('Task marked as completed successfully');
      setShowCompletionForm(false);
      
      // Add comment about task completion
      if (completionNotes.trim()) {
        await addCompletionComment();
      }
      
      if (onTaskCompleted) {
        onTaskCompleted();
      }
    } catch (err) {
      console.error('Error completing task:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete task');
    } finally {
      setIsCompleting(false);
    }
  };

  const addCompletionComment = async () => {
    try {
      await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `✅ Task completed: ${completionNotes}`,
          type: 'COMPLETION',
        }),
      });
    } catch (error) {
      console.error('Error adding completion comment:', error);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'No date set';
    return format(new Date(date), 'MMM d, yyyy');
  };

  const isOverdue = () => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = new Date(dueDate);
    taskDueDate.setHours(0, 0, 0, 0);
    return taskDueDate < today && currentStatus !== 'COMPLETED' && currentStatus !== 'CANCELLED';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Task Completion</h3>
      
      {isTaskCompleted ? (
        <div className="bg-green-50 p-4 rounded-md border border-green-200">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-800">Task Completed</h4>
              <p className="mt-1 text-xs text-green-700">
                This task has been marked as completed.
              </p>
            </div>
          </div>
        </div>
      ) : isTaskCancelled ? (
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Task Cancelled</h4>
              <p className="mt-1 text-xs text-red-700">
                This task has been cancelled and no further action is required.
              </p>
            </div>
          </div>
        </div>
      ) : isOverdue() ? (
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Task Overdue</h4>
              <p className="mt-1 text-xs text-yellow-700">
                This task is past its due date ({formatDate(dueDate)}). Please update its status or mark it as completed.
              </p>
              
              {!showCompletionForm && (
                <button
                  type="button"
                  onClick={handleShowCompletionForm}
                  className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700"
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {!showCompletionForm ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ClipboardCheck className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">Ready to complete this task?</span>
              </div>
              <button
                type="button"
                onClick={handleShowCompletionForm}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Complete Task
              </button>
            </div>
          ) : null}
        </>
      )}
      
      {showCompletionForm && canComplete && (
        <form onSubmit={handleTaskCompletion} className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Complete Task</h4>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="completionDate" className="block text-xs font-medium text-gray-700 mb-1">
                Completion Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="completionDate"
                  name="completionDate"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="completionNotes" className="block text-xs font-medium text-gray-700 mb-1">
                Completion Notes
              </label>
              <textarea
                id="completionNotes"
                name="completionNotes"
                rows={3}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Add any notes about how this task was completed..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              ></textarea>
            </div>
            
            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={handleCancelCompletion}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCompleting}
                className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCompleting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Completing...
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4 mr-1" />
                    Mark as Completed
                  </>
                )}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-2 text-xs text-red-600">
              {error}
            </div>
          )}
        </form>
      )}
      
      {successMessage && (
        <div className="mt-2 bg-green-50 p-2 rounded-md border border-green-200 text-xs text-green-700">
          {successMessage}
        </div>
      )}
      
      {isTaskCompleted && dueDate && (
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
          <span>
            {new Date(dueDate) >= new Date() ? 
              'Completed before deadline' : 
              'Completed after deadline'}
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskCompletionWorkflow;
