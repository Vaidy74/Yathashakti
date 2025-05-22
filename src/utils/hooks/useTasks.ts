import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date | null;
  assigneeId?: string | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
  } | null;
  relatedProgramId?: string | null;
  originatingMilestoneId?: string | null;
  originatingMilestone?: {
    id: string;
    title: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TasksResponse {
  tasks: Task[];
  pagination: Pagination;
}

interface UseTasksOptions {
  assigneeId?: string;
  status?: string;
  priority?: string;
  programId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useTasks(options: UseTasksOptions = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async (options: UseTasksOptions = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      if (options.assigneeId) params.append('assigneeId', options.assigneeId);
      if (options.status) params.append('status', options.status);
      if (options.priority) params.append('priority', options.priority);
      if (options.programId) params.append('programId', options.programId);
      if (options.search) params.append('search', options.search);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());

      const response = await fetch(`/api/tasks?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data: TasksResponse = await response.json();
      setTasks(data.tasks);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(options);
  }, [
    options.assigneeId,
    options.status,
    options.priority,
    options.programId,
    options.search,
    options.page,
    options.limit,
  ]);

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      fetchTasks(options); // Refresh the list
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => (task.id === id ? updatedTask : task)));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter(task => task.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  };

  return {
    tasks,
    pagination,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}

export type { Task, Pagination, TasksResponse, UseTasksOptions };
