"use client";

import { useState, useEffect } from 'react';
import { Task } from '@/utils/hooks/useTasks';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  User,
  Calendar,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

interface KanbanBoardProps {
  tasks: Task[];
  isLoading: boolean;
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
}

export default function KanbanBoard({ tasks, isLoading, onStatusChange }: KanbanBoardProps) {
  const [columns, setColumns] = useState<{
    todo: Task[];
    inProgress: Task[];
    completed: Task[];
    cancelled: Task[];
  }>({
    todo: [],
    inProgress: [],
    completed: [],
    cancelled: [],
  });

  // Update columns when tasks change
  useEffect(() => {
    const todo = tasks.filter(task => task.status === 'TO_DO');
    const inProgress = tasks.filter(task => task.status === 'IN_PROGRESS');
    const completed = tasks.filter(task => task.status === 'COMPLETED');
    const cancelled = tasks.filter(task => task.status === 'CANCELLED');

    setColumns({
      todo,
      inProgress,
      completed,
      cancelled,
    });
  }, [tasks]);

  // Drag and drop functionality
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);

  const handleDragStart = (task: Task) => {
    setDraggingTask(task);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (columnName: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') => {
    if (draggingTask && draggingTask.status !== columnName) {
      onStatusChange(draggingTask.id, columnName);
    }
    setDraggingTask(null);
  };

  // Format date for display
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'No due date';
    return format(new Date(date), 'MMM d, yyyy');
  };

  // Get priority class
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800';
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render Kanban columns
  const renderColumn = (
    title: string, 
    tasks: Task[], 
    icon: React.ReactNode, 
    columnClass: string,
    columnName: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  ) => {
    return (
      <div className={`flex flex-col h-full rounded-lg shadow-sm border ${columnClass}`}>
        <div className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center">
            {icon}
            <h3 className="text-sm font-medium ml-2">{title}</h3>
            <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-white bg-opacity-80">
              {tasks.length}
            </span>
          </div>
        </div>
        <div 
          className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[50vh]"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(columnName)}
        >
          {tasks.map(task => (
            <div
              key={task.id}
              draggable
              onDragStart={() => handleDragStart(task)}
              className="bg-white p-3 rounded shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
            >
              <h4 className="font-medium text-sm mb-2 text-gray-800">{task.title}</h4>
              
              <div className="mt-2 space-y-2">
                {/* Priority */}
                <div className="flex items-center">
                  <span className={`text-xs rounded-full px-2 py-0.5 ${getPriorityClass(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                
                {/* Due date */}
                {task.dueDate && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(task.dueDate)}
                  </div>
                )}
                
                {/* Assignee */}
                {task.assignee && (
                  <div className="flex items-center text-xs text-gray-600">
                    <User className="h-3 w-3 mr-1" />
                    {task.assignee.name}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Empty state */}
          {tasks.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-20 text-center text-gray-500 text-xs border border-dashed border-gray-300 rounded-md bg-gray-50">
              <p>No tasks</p>
              <p className="mt-1">Drag and drop tasks here</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
      {renderColumn(
        'To Do',
        columns.todo,
        <Clock className="h-4 w-4 text-yellow-600" />,
        'bg-yellow-50 border-yellow-200',
        'TODO'
      )}
      
      {renderColumn(
        'In Progress',
        columns.inProgress,
        <AlertCircle className="h-4 w-4 text-blue-600" />,
        'bg-blue-50 border-blue-200',
        'IN_PROGRESS'
      )}
      
      {renderColumn(
        'Completed',
        columns.completed,
        <CheckCircle2 className="h-4 w-4 text-green-600" />,
        'bg-green-50 border-green-200',
        'COMPLETED'
      )}
      
      {renderColumn(
        'Cancelled',
        columns.cancelled,
        <XCircle className="h-4 w-4 text-red-600" />,
        'bg-red-50 border-red-200',
        'CANCELLED'
      )}
    </div>
  );
}
