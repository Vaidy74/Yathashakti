"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { CheckSquare, Calendar, ChevronLeft, Save, AlertCircle } from "lucide-react";

export default function CreateTaskPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    dueDate: new Date().toISOString().split('T')[0],
    assignedTo: "",
    category: "",
    relatedItemType: "",
    relatedItemId: "",
    relatedItemName: ""
  });
  const [errors, setErrors] = useState({});

  // Mock data for assignees
  const assignees = [
    "Arjun Singh",
    "Neha Patel",
    "Meera Joshi",
    "Divya Kapoor",
    "Rahul Sharma"
  ];

  // Mock data for categories
  const categories = [
    "Application Review",
    "Site Visit",
    "Repayment Collection",
    "Reporting",
    "Training",
    "Follow-up",
    "Documentation",
    "Other"
  ];

  // Mock data for related items
  const relatedItems = {
    grantee: [
      { id: "G001", name: "Vijay Kumar" },
      { id: "G002", name: "Priya Sharma" },
      { id: "G003", name: "Rahul Verma" }
    ],
    grant: [
      { id: "GR001", name: "Agricultural Equipment Grant" },
      { id: "GR002", name: "Dairy Equipment Grant" },
      { id: "GR003", name: "Retail Shop Expansion Grant" }
    ],
    program: [
      { id: "P001", name: "Rural Entrepreneurship Support" },
      { id: "P002", name: "Women Entrepreneurship" },
      { id: "P003", name: "Youth Skill Development" }
    ],
    donor: [
      { id: "D001", name: "TechCorp Foundation" },
      { id: "D002", name: "Agri-Growth Trust" },
      { id: "D003", name: "Global Impact Fund" }
    ]
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Handle related item type change
  const handleRelatedTypeChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      relatedItemType: value,
      relatedItemId: "",
      relatedItemName: ""
    });
  };

  // Handle related item selection
  const handleRelatedItemChange = (e) => {
    const selectedId = e.target.value;
    const selectedType = formData.relatedItemType;
    
    if (selectedId && selectedType) {
      const selectedItem = relatedItems[selectedType].find(item => item.id === selectedId);
      
      if (selectedItem) {
        setFormData({
          ...formData,
          relatedItemId: selectedId,
          relatedItemName: selectedItem.name
        });
      }
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Task description is required";
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    
    if (!formData.assignedTo) {
      newErrors.assignedTo = "Task must be assigned to someone";
    }
    
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    
    // If related item type is selected, related item must also be selected
    if (formData.relatedItemType && !formData.relatedItemId) {
      newErrors.relatedItemId = "Please select a related item";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call
      console.log("Submitting task data:", formData);
      
      // Prepare relatedTo object if applicable
      const taskData = {
        ...formData,
        relatedTo: formData.relatedItemType 
          ? {
              type: formData.relatedItemType,
              id: formData.relatedItemId,
              name: formData.relatedItemName
            }
          : undefined
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setShowSuccess(true);
      
      // Redirect after delay
      setTimeout(() => {
        router.push("/tasks");
      }, 2000);
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link 
            href="/tasks" 
            className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Tasks
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <CheckSquare className="h-6 w-6 mr-2 text-blue-500" />
            Create New Task
          </h1>
        </div>

        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-green-400" />
            <span>Task created successfully! Redirecting...</span>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Task Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Create a new task to track and manage your team's work.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Task Title */}
                <div className="sm:col-span-6">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.title ? "border-red-300" : ""
                      }`}
                      placeholder="Enter a clear, specific task title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.description ? "border-red-300" : ""
                      }`}
                      placeholder="Provide details about what needs to be done"
                    ></textarea>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>
                </div>

                {/* Due Date */}
                <div className="sm:col-span-3">
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="dueDate"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${
                        errors.dueDate ? "border-red-300" : ""
                      }`}
                    />
                    {errors.dueDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                    )}
                  </div>
                </div>

                {/* Priority */}
                <div className="sm:col-span-3">
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Assignee */}
                <div className="sm:col-span-3">
                  <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                    Assign To <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <select
                      id="assignedTo"
                      name="assignedTo"
                      value={formData.assignedTo}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.assignedTo ? "border-red-300" : ""
                      }`}
                    >
                      <option value="">Select assignee</option>
                      {assignees.map((assignee, index) => (
                        <option key={index} value={assignee}>{assignee}</option>
                      ))}
                    </select>
                    {errors.assignedTo && (
                      <p className="mt-1 text-sm text-red-600">{errors.assignedTo}</p>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="sm:col-span-3">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        errors.category ? "border-red-300" : ""
                      }`}
                    >
                      <option value="">Select category</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>
                </div>

                {/* Related Item Type */}
                <div className="sm:col-span-2">
                  <label htmlFor="relatedItemType" className="block text-sm font-medium text-gray-700">
                    Related To (Optional)
                  </label>
                  <div className="mt-1">
                    <select
                      id="relatedItemType"
                      name="relatedItemType"
                      value={formData.relatedItemType}
                      onChange={handleRelatedTypeChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">None</option>
                      <option value="grantee">Grantee</option>
                      <option value="grant">Grant</option>
                      <option value="program">Program</option>
                      <option value="donor">Donor</option>
                    </select>
                  </div>
                </div>

                {/* Related Item */}
                {formData.relatedItemType && (
                  <div className="sm:col-span-4">
                    <label htmlFor="relatedItemId" className="block text-sm font-medium text-gray-700">
                      Select {formData.relatedItemType.charAt(0).toUpperCase() + formData.relatedItemType.slice(1)}
                    </label>
                    <div className="mt-1">
                      <select
                        id="relatedItemId"
                        name="relatedItemId"
                        value={formData.relatedItemId}
                        onChange={handleRelatedItemChange}
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.relatedItemId ? "border-red-300" : ""
                        }`}
                      >
                        <option value="">Select {formData.relatedItemType}</option>
                        {relatedItems[formData.relatedItemType]?.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                      {errors.relatedItemId && (
                        <p className="mt-1 text-sm text-red-600">{errors.relatedItemId}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-5 flex items-center justify-between">
                <div className="text-sm text-gray-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>Fields marked with <span className="text-red-500">*</span> are required</span>
                </div>
                <div className="flex space-x-3">
                  <Link
                    href="/tasks"
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Creating..." : "Create Task"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
