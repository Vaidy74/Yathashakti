"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { Task } from "@/utils/hooks/useTasks";
import { format } from "date-fns";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Calendar,
  User,
  Bookmark,
  FileText,
  Edit,
  ChevronLeft,
  MessageSquare,
  Paperclip,
  Plus,
  MoreVertical,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import TaskAssignmentManager from "@/components/tasks/assignment/TaskAssignmentManager";
import TaskProgressTracker from "@/components/tasks/progress/TaskProgressTracker";
import TaskCompletionWorkflow from "@/components/tasks/completion/TaskCompletionWorkflow";

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<{ id: string; author: string; content: string; createdAt: Date }[]>([
    {
      id: "c1",
      author: "Aditya Sharma",
      content: "I spoke with the grantee yesterday. They are preparing the necessary documents.",
      createdAt: new Date(2025, 4, 20, 10, 30),
    },
    {
      id: "c2",
      author: "Priya Singh",
      content: "When do we need to complete this task? Is there a deadline?",
      createdAt: new Date(2025, 4, 21, 14, 15),
    },
  ]);
  const [newComment, setNewComment] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch task details
  const fetchTaskDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/tasks/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch task details');
      }
      
      const data = await response.json();
      setTask(data);
    } catch (err) {
      console.error('Error fetching task:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch task');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const fetchTask = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/tasks/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch task");
        }

        const data = await response.json();
        setTask(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [params.id]);

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;

    try {
      const response = await fetch(`/api/tasks/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      const updatedTask = await response.json();
      setTask(updatedTask);
      setShowDropdown(false);
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: `c${Date.now()}`,
      author: "You", // In a real app, get from user session
      content: newComment,
      createdAt: new Date(),
    };

    setComments([...comments, comment]);
    setNewComment("");

    // In a real app, save comment to database here
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`/api/tasks/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      router.push("/tasks");
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Format date
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "No date set";
    return format(new Date(date), "MMMM d, yyyy");
  };

  // Get status badge class
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TO_DO":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority badge class
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-gray-100 text-gray-800";
      case "MEDIUM":
        return "bg-blue-100 text-blue-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "URGENT":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "TO_DO":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "IN_PROGRESS":
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case "TO_DO":
        return "To Do";
      case "IN_PROGRESS":
        return "In Progress";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Task Details</h1>
          </div>
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
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !task) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Task Details</h1>
          </div>
          <div className="mt-8 bg-red-50 p-4 rounded-md border border-red-200">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">
                {error || "Failed to load task. The task may have been deleted."}
              </p>
            </div>
            <Link
              href="/tasks"
              className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Tasks
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              Task Details
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href={`/tasks/${params.id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      onClick={handleDeleteTask}
                    >
                      Delete Task
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task content */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Task header */}
          <div className="p-5 border-b border-gray-200 bg-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{task.title}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center ${getStatusBadge(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span className="ml-1">{formatStatus(task.status)}</span>
                  </span>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getPriorityBadge(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Task details */}
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Details */}
              <div className="md:col-span-2 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <div className="text-gray-900 text-sm bg-gray-50 p-4 rounded-md border border-gray-200 min-h-[100px]">
                    {task.description || <span className="text-gray-400 italic">No description provided</span>}
                  </div>
                </div>

                {/* Comments section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Comments ({comments.length})
                  </h3>

                  {/* Comment list */}
                  <div className="space-y-4 mb-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-sm text-gray-900">{comment.author}</div>
                          <div className="text-xs text-gray-500">
                            {format(comment.createdAt, "MMM d, yyyy 'at' h:mm a")}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))}

                    {comments.length === 0 && (
                      <div className="text-center py-6 text-gray-500 italic text-sm">
                        No comments yet
                      </div>
                    )}
                  </div>

                  {/* Comment form */}
                  <form onSubmit={handleCommentSubmit} className="mt-4">
                    <div className="mt-1">
                      <textarea
                        rows={3}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        disabled={!newComment.trim()}
                      >
                        Add Comment
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right column - Metadata */}
              <div className="space-y-6">
                {/* Task Progress Tracking */}
                <TaskProgressTracker
                  taskId={params.id}
                  currentStatus={task.status}
                  onStatusUpdated={fetchTaskDetails}
                />
                
                {/* Task Completion Workflow */}
                <TaskCompletionWorkflow
                  taskId={params.id}
                  currentStatus={task.status}
                  dueDate={task.dueDate}
                  onTaskCompleted={fetchTaskDetails}
                />
                {/* Due date */}
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Due Date</h3>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>

                {/* Assignee */}
                <TaskAssignmentManager
                  taskId={params.id}
                  currentAssigneeId={task.assigneeId || null}
                  currentAssigneeName={task.assignee?.name || null}
                  onAssignmentUpdated={fetchTaskDetails}
                />

                {/* Created */}
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Created</h3>
                  <div className="flex items-center text-sm">
                    <FileText className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {formatDate(task.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Related Program */}
                {task.relatedProgramId && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Related Program</h3>
                    <div className="flex items-center text-sm">
                      <Bookmark className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-blue-600 hover:text-blue-800">
                        <Link href={`/programs/${task.relatedProgramId}`}>
                          View Program
                        </Link>
                      </span>
                    </div>
                  </div>
                )}

                {/* Milestone */}
                {task.originatingMilestone && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Related Milestone</h3>
                    <div className="flex items-center text-sm">
                      <Paperclip className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {task.originatingMilestone.title}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
