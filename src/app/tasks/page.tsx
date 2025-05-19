"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import TaskCard from "@/components/tasks/TaskCard";
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Tag, 
  Grid,
  List
} from "lucide-react";

export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Mock tasks data
  const [tasks, setTasks] = useState([
    {
      id: "task1",
      title: "Review grant application from Vijay Kumar",
      description: "Review and process the grant application submitted by Vijay Kumar for agricultural equipment funding. Check all documentation and prepare for committee review.",
      status: "pending" as const,
      priority: "high" as const,
      dueDate: "2025-05-25",
      assignedTo: "Arjun Singh",
      category: "Application Review",
      relatedTo: {
        type: "grantee" as const,
        id: "G001",
        name: "Vijay Kumar"
      }
    },
    {
      id: "task2",
      title: "Conduct site visit for Priya Sharma's dairy farm",
      description: "Visit Priya Sharma's dairy farm to verify implementation of funded equipment and assess impact of the grant given last month.",
      status: "in-progress" as const,
      priority: "medium" as const,
      dueDate: "2025-05-30",
      assignedTo: "Neha Patel",
      category: "Site Visit",
      relatedTo: {
        type: "grant" as const,
        id: "GR003",
        name: "Dairy Equipment Grant"
      }
    },
    {
      id: "task3",
      title: "Collect overdue repayment from Rahul Verma",
      description: "Contact Rahul Verma regarding the overdue repayment installment that was due last week. Document any issues or challenges faced.",
      status: "overdue" as const,
      priority: "urgent" as const,
      dueDate: "2025-05-10",
      assignedTo: "Arjun Singh",
      category: "Repayment Collection",
      relatedTo: {
        type: "grant" as const,
        id: "GR007",
        name: "Retail Shop Expansion Grant"
      }
    },
    {
      id: "task4",
      title: "Prepare quarterly report for Rural Entrepreneurship program",
      description: "Compile data and impact stories from the Rural Entrepreneurship program for the quarterly donor report due at the end of the month.",
      status: "in-progress" as const,
      priority: "high" as const,
      dueDate: "2025-05-28",
      assignedTo: "Meera Joshi",
      category: "Reporting",
      relatedTo: {
        type: "program" as const,
        id: "P001",
        name: "Rural Entrepreneurship Support"
      }
    },
    {
      id: "task5",
      title: "Schedule training workshop with FinSkill Academy",
      description: "Coordinate with FinSkill Academy to schedule the financial literacy workshop for grantees in the Women Entrepreneurship program.",
      status: "completed" as const,
      priority: "medium" as const,
      dueDate: "2025-05-12",
      assignedTo: "Divya Kapoor",
      category: "Training",
      relatedTo: {
        type: "program" as const,
        id: "P003",
        name: "Women Entrepreneurship"
      }
    }
  ]);

  // Get unique assignees for filter dropdown
  const assignees = [...new Set(tasks.map(task => task.assignedTo))];

  // Filter tasks based on search term and filters
  const filteredTasks = tasks.filter(task => {
    // Filter by search term
    const matchesSearch = searchTerm === "" || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = filterStatus === "all" || 
      task.status === filterStatus ||
      (filterStatus === "overdue" && 
        new Date(task.dueDate) < new Date() && 
        task.status !== "completed");
    
    // Filter by priority
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    
    // Filter by assignee
    const matchesAssignee = filterAssignee === "all" || task.assignedTo === filterAssignee;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  // Update task status
  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
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

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-2 sm:text-sm border-gray-300 rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-2 sm:text-sm border-gray-300 rounded-md"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-2 sm:text-sm border-gray-300 rounded-md"
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
            >
              <option value="all">All Assignees</option>
              {assignees.map((assignee, index) => (
                <option key={index} value={assignee}>{assignee}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end items-center space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${viewMode === "list" ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:text-gray-600"}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tasks */}
        {filteredTasks.length > 0 ? (
          <div className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}`}>
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new task or adjust your filters.
            </p>
            <div className="mt-6">
              <Link
                href="/tasks/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
