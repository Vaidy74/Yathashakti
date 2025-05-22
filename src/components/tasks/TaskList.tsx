"use client";

import { useState } from "react";
import { useTasks, Task } from "@/utils/hooks/useTasks";
import TaskCard from "./TaskCard";
import { 
  Filter, 
  Search, 
  Calendar,
  User,
  Tag,
  AlertCircle,
  Grid,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface TaskListProps {
  initialFilters?: {
    search?: string;
    status?: string;
    priority?: string;
    assigneeId?: string;
    programId?: string;
  };
}

export default function TaskList({ initialFilters = {} }: TaskListProps) {
  // Filters state
  const [search, setSearch] = useState(initialFilters.search || "");
  const [status, setStatus] = useState(initialFilters.status || "");
  const [priority, setPriority] = useState(initialFilters.priority || "");
  const [assigneeId, setAssigneeId] = useState(initialFilters.assigneeId || "");
  const [programId, setProgramId] = useState(initialFilters.programId || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch tasks with the current filters
  const { 
    tasks, 
    pagination, 
    isLoading, 
    error, 
    updateTask 
  } = useTasks({
    search,
    status,
    priority,
    assigneeId,
    programId,
    page: currentPage,
    limit: 12,
  });

  // Convert API task to TaskCard format
  const mapTaskForCard = (task: Task) => {
    // Convert API status format to TaskCard format
    const statusMap: Record<string, "pending" | "in-progress" | "completed" | "overdue"> = {
      TO_DO: "pending",
      IN_PROGRESS: "in-progress",
      COMPLETED: "completed",
      CANCELLED: "overdue" // Using overdue for CANCELLED for now
    };

    // Convert API priority format to TaskCard format
    const priorityMap: Record<string, "low" | "medium" | "high" | "urgent"> = {
      LOW: "low",
      MEDIUM: "medium",
      HIGH: "high",
      URGENT: "urgent"
    };

    return {
      id: task.id,
      title: task.title,
      description: task.description || "",
      status: statusMap[task.status],
      priority: priorityMap[task.priority],
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : new Date().toISOString(),
      assignedTo: task.assignee?.name || "Unassigned",
      category: "Task", // Default category
      relatedTo: task.relatedProgramId ? {
        type: "program" as const,
        id: task.relatedProgramId,
        name: "Related Program" // Ideally, we'd fetch the program name
      } : undefined
    };
  };

  // Handle status change
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    // Convert UI status format to API format
    const statusMap: Record<string, "TO_DO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"> = {
      pending: "TO_DO",
      "in-progress": "IN_PROGRESS",
      completed: "COMPLETED",
      overdue: "TO_DO" // Map overdue back to TO_DO
    };
    
    try {
      await updateTask(taskId, { status: statusMap[newStatus] });
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  // Handle filter changes
  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setAssigneeId("");
    setProgramId("");
    setCurrentPage(1);
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2 relative rounded-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="relative rounded-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-2 sm:text-sm border-gray-300 rounded-md"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="TO_DO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          
          <div className="relative rounded-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-2 sm:text-sm border-gray-300 rounded-md"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={applyFilters}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* View type selector */}
      <div className="flex justify-end mb-2">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
          >
            <Grid className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
          >
            <ListIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <span className="ml-2 text-gray-600">Loading tasks...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">Error loading tasks: {error}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && tasks.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center bg-gray-100 rounded-full">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No tasks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {search || status || priority || assigneeId || programId 
              ? "Try changing your filters or create a new task."
              : "Get started by creating your first task."}
          </p>
        </div>
      )}

      {/* Task grid/list */}
      {!isLoading && tasks.length > 0 && (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
          : "space-y-4"
        }>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={mapTaskForCard(task)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-md shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? "text-gray-300 bg-white"
                  : "text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === pagination.totalPages}
              className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                currentPage === pagination.totalPages
                  ? "text-gray-300 bg-white"
                  : "text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{tasks.length}</span> of{" "}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? "text-gray-300 bg-white"
                    : "text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === pagination.totalPages}
                className={`relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  currentPage === pagination.totalPages
                    ? "text-gray-300 bg-white"
                    : "text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
