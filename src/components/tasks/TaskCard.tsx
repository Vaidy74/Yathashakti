"use client";

import { useState } from "react";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  User, 
  Tag, 
  ArrowRight, 
  Link as LinkIcon, 
  MoreVertical 
} from "lucide-react";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    status: "pending" | "in-progress" | "completed" | "overdue";
    priority: "low" | "medium" | "high" | "urgent";
    dueDate: string;
    assignedTo: string;
    category: string;
    relatedTo?: {
      type: "grantee" | "grant" | "program" | "donor";
      id: string;
      name: string;
    };
  };
  onStatusChange: (taskId: string, newStatus: string) => void;
}

export default function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Check if task is due soon (within 2 days)
  const isDueSoon = () => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && diffDays >= 0;
  };

  // Check if task is overdue
  const isOverdue = () => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate < today && task.status !== "completed";
  };

  // Get status badge style
  const getStatusBadge = () => {
    if (isOverdue()) {
      return "bg-red-100 text-red-800";
    }
    
    switch (task.status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority badge style
  const getPriorityBadge = () => {
    switch (task.priority) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case "in-progress":
        return "In Progress";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Toggle expanded view
  const toggleOpen = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    onStatusChange(task.id, newStatus);
    setShowDropdown(false);
  };

  return (
    <div className={`bg-white rounded-lg shadow border-l-4 ${
      task.status === "completed"
        ? "border-green-500"
        : isOverdue()
        ? "border-red-500"
        : task.priority === "urgent"
        ? "border-red-500"
        : task.priority === "high"
        ? "border-orange-500"
        : "border-blue-500"
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            {task.status === "completed" && (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            )}
            <span className={task.status === "completed" ? "line-through text-gray-500" : ""}>
              {task.title}
            </span>
          </h3>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-gray-400 hover:text-gray-600"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleStatusChange("pending")}
                  >
                    Set as Pending
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleStatusChange("in-progress")}
                  >
                    Set as In Progress
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleStatusChange("completed")}
                  >
                    Mark as Completed
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge()}`}>
            {formatStatus(task.status)}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge()}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </span>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
            {task.category}
          </span>
        </div>

        <div className="flex flex-wrap items-center mt-3 text-sm text-gray-500 space-y-1">
          <div className="flex items-center mr-4">
            <Calendar className="h-4 w-4 mr-1" />
            <span className={`${isOverdue() ? "text-red-600 font-medium" : isDueSoon() ? "text-orange-600 font-medium" : ""}`}>
              {formatDate(task.dueDate)}
              {isDueSoon() && !isOverdue() && " (Soon)"}
              {isOverdue() && " (Overdue)"}
            </span>
          </div>
          <div className="flex items-center mr-4">
            <User className="h-4 w-4 mr-1" />
            <span>{task.assignedTo}</span>
          </div>
          {task.relatedTo && (
            <div className="flex items-center">
              <LinkIcon className="h-4 w-4 mr-1" />
              <span>{task.relatedTo.type.charAt(0).toUpperCase() + task.relatedTo.type.slice(1)}: {task.relatedTo.name}</span>
            </div>
          )}
        </div>

        <div className="mt-3">
          <button
            onClick={toggleOpen}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            {isOpen ? "Hide details" : "Show details"}
            <ArrowRight className={`h-4 w-4 ml-1 transition-transform ${isOpen ? "rotate-90" : ""}`} />
          </button>
        </div>

        {isOpen && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">{task.description}</p>
            
            <div className="mt-4 flex justify-end space-x-2">
              {task.status !== "completed" ? (
                <button
                  onClick={() => handleStatusChange("completed")}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Complete
                </button>
              ) : (
                <button
                  onClick={() => handleStatusChange("in-progress")}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Reopen Task
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
