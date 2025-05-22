"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Task } from "@/utils/hooks/useTasks";
import { ArrowLeft, Calendar, AlertCircle } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Program {
  id: string;
  name: string;
}

interface Milestone {
  id: string;
  title: string;
}

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === "new";
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Task form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TO_DO",
    priority: "MEDIUM",
    dueDate: "",
    assigneeId: "",
    relatedProgramId: "",
    originatingMilestoneId: "",
  });

  // Options for dropdown selects
  const [users, setUsers] = useState<User[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Fetch task data if editing an existing task
  useEffect(() => {
    if (isNew) return;

    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch task");
        }

        const task: Task = await response.json();
        
        setFormData({
          title: task.title,
          description: task.description || "",
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
          assigneeId: task.assigneeId || "",
          relatedProgramId: task.relatedProgramId || "",
          originatingMilestoneId: task.originatingMilestoneId || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [isNew, params.id]);

  // Fetch users, programs, and milestones for dropdowns
  useEffect(() => {
    // Fetch users
    const fetchUsers = async () => {
      try {
        // In a real app, fetch from API
        // Mock data for now
        setUsers([
          { id: "user1", name: "Aditya Sharma", email: "aditya@example.com" },
          { id: "user2", name: "Priya Singh", email: "priya@example.com" },
          { id: "user3", name: "Rahul Verma", email: "rahul@example.com" },
        ]);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    // Fetch programs
    const fetchPrograms = async () => {
      try {
        // In a real app, fetch from API
        // Mock data for now
        setPrograms([
          { id: "program1", name: "Rural Entrepreneurship Support" },
          { id: "program2", name: "Women Empowerment Initiative" },
          { id: "program3", name: "Agricultural Development Fund" },
        ]);
      } catch (error) {
        console.error("Error fetching programs:", error);
      }
    };

    // Fetch milestones
    const fetchMilestones = async () => {
      try {
        // In a real app, fetch from API based on selected program
        // Mock data for now
        setMilestones([
          { id: "milestone1", title: "Project Planning" },
          { id: "milestone2", title: "Implementation Phase" },
          { id: "milestone3", title: "Monitoring & Evaluation" },
        ]);
      } catch (error) {
        console.error("Error fetching milestones:", error);
      }
    };

    fetchUsers();
    fetchPrograms();
    fetchMilestones();
  }, []);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      if (isNaN(dueDate.getTime())) {
        errors.dueDate = "Invalid date format";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const url = isNew ? "/api/tasks" : `/api/tasks/${params.id}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save task");
      }

      const savedTask = await response.json();
      router.push(`/tasks/${savedTask.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isNew ? "Create Task" : "Edit Task"}
          </h1>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 bg-red-50 p-4 rounded-md border border-red-200">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="mt-8 flex justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-6 py-1">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-4 bg-gray-200 rounded col-span-2"></div>
                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Task form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5">
                {/* Title */}
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`block w-full shadow-sm sm:text-sm rounded-md ${
                      validationErrors.title
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                    placeholder="Enter task title"
                  />
                  {validationErrors.title && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the task in detail"
                  ></textarea>
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="TO_DO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div className="mb-4">
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="dueDate"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className={`block w-full pl-10 shadow-sm sm:text-sm rounded-md ${
                        validationErrors.dueDate
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                  </div>
                  {validationErrors.dueDate && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.dueDate}</p>
                  )}
                </div>

                {/* Assignee */}
                <div className="mb-4">
                  <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700 mb-1">
                    Assignee
                  </label>
                  <select
                    id="assigneeId"
                    name="assigneeId"
                    value={formData.assigneeId}
                    onChange={handleChange}
                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Related Program */}
                <div className="mb-4">
                  <label htmlFor="relatedProgramId" className="block text-sm font-medium text-gray-700 mb-1">
                    Related Program
                  </label>
                  <select
                    id="relatedProgramId"
                    name="relatedProgramId"
                    value={formData.relatedProgramId}
                    onChange={handleChange}
                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">None</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Milestone */}
                <div className="mb-4">
                  <label htmlFor="originatingMilestoneId" className="block text-sm font-medium text-gray-700 mb-1">
                    Related Milestone
                  </label>
                  <select
                    id="originatingMilestoneId"
                    name="originatingMilestoneId"
                    value={formData.originatingMilestoneId}
                    onChange={handleChange}
                    className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={!formData.relatedProgramId}
                  >
                    <option value="">None</option>
                    {milestones.map((milestone) => (
                      <option key={milestone.id} value={milestone.id}>
                        {milestone.title}
                      </option>
                    ))}
                  </select>
                  {!formData.relatedProgramId && (
                    <p className="mt-1 text-xs text-gray-500">
                      Select a program first to enable milestone selection
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Task"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
