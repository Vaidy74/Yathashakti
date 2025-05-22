"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import TaskList from "@/components/tasks/TaskList";
import KanbanBoard from "@/components/tasks/KanbanBoard";
import { useTasks } from "@/utils/hooks/useTasks";
import { 
  CheckSquare, 
  Plus, 
  ListIcon,
  KanbanIcon
} from "lucide-react";

export default function TasksPage() {
  // View mode: 'list' or 'kanban'
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  
  // Fetch tasks using our custom hook
  const {
    tasks,
    isLoading,
    error,
    updateTask
  } = useTasks();
  
  // Handle task status change
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTask(taskId, { status: newStatus as "TO_DO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" });
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <CheckSquare className="h-6 w-6 mr-2 text-blue-500" />
            Task Management
          </h1>
          <Link
            href="/tasks/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Link>
        </div>

        {/* View Type Toggle */}
        <div className="flex justify-end mb-4">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode("list")}
              className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${viewMode === "list" ? "bg-blue-50 text-blue-600 border-blue-500 z-10" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              <ListIcon className="h-4 w-4 mr-1" />
              List View
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${viewMode === "kanban" ? "bg-blue-50 text-blue-600 border-blue-500 z-10" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              <KanbanIcon className="h-4 w-4 mr-1" />
              Kanban Board
            </button>
          </div>
        </div>

        {/* Task views */}
        {viewMode === "list" ? (
          <TaskList initialFilters={{}} />
        ) : (
          <KanbanBoard 
            tasks={tasks} 
            isLoading={isLoading} 
            onStatusChange={handleStatusChange} 
          />
        )}
      </div>
    </DashboardLayout>
  );
}
