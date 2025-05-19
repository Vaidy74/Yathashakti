"use client";

import { useState } from "react";
import { Save } from "lucide-react";

export default function ServiceProviderForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
    location: "",
    description: "",
    website: "",
    services: [],
    ratePerDay: "",
  });

  const [errors, setErrors] = useState({});

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Handle services as comma-separated string
  const handleServicesChange = (e) => {
    const servicesString = e.target.value;
    const servicesArray = servicesString
      .split(',')
      .map(service => service.trim())
      .filter(service => service !== "");
    
    setFormData({
      ...formData,
      services: servicesArray,
    });
  };

  // Convert services array back to comma-separated string for display
  const servicesToString = () => {
    return formData.services.join(", ");
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Provider name is required";
    }
    
    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }
    
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required";
    }
    
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    
    if (formData.ratePerDay && isNaN(parseFloat(formData.ratePerDay))) {
      newErrors.ratePerDay = "Rate must be a valid number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        {/* Provider Name */}
        <div className="sm:col-span-3">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Provider Name <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.name ? "border-red-300" : ""
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
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
              <option value="">Select a category</option>
              <option value="Technical Training">Technical Training</option>
              <option value="Agricultural Advisory">Agricultural Advisory</option>
              <option value="Financial Literacy">Financial Literacy</option>
              <option value="Gender-focused Training">Gender-focused Training</option>
              <option value="Environmental Consulting">Environmental Consulting</option>
              <option value="Legal Advisory">Legal Advisory</option>
              <option value="Marketing Support">Marketing Support</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Contact Person */}
        <div className="sm:col-span-3">
          <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
            Contact Person <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="contactPerson"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.contactPerson ? "border-red-300" : ""
              }`}
            />
            {errors.contactPerson && (
              <p className="mt-1 text-sm text-red-600">{errors.contactPerson}</p>
            )}
          </div>
        </div>

        {/* Contact Number */}
        <div className="sm:col-span-3">
          <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="contactNumber"
              name="contactNumber"
              placeholder="+91 98765 43210"
              value={formData.contactNumber}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.contactNumber ? "border-red-300" : ""
              }`}
            />
            {errors.contactNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="sm:col-span-3">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.email ? "border-red-300" : ""
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Website */}
        <div className="sm:col-span-3">
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Website
          </label>
          <div className="mt-1">
            <input
              type="url"
              id="website"
              name="website"
              placeholder="https://example.com"
              value={formData.website}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Location */}
        <div className="sm:col-span-6">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="location"
              name="location"
              placeholder="City, State"
              value={formData.location}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.location ? "border-red-300" : ""
              }`}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </div>
        </div>

        {/* Rate Per Day */}
        <div className="sm:col-span-3">
          <label htmlFor="ratePerDay" className="block text-sm font-medium text-gray-700">
            Rate Per Day (INR)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="text"
              id="ratePerDay"
              name="ratePerDay"
              value={formData.ratePerDay}
              onChange={handleChange}
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 sm:text-sm border-gray-300 rounded-md ${
                errors.ratePerDay ? "border-red-300" : ""
              }`}
              placeholder="0.00"
            />
            {errors.ratePerDay && (
              <p className="mt-1 text-sm text-red-600">{errors.ratePerDay}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="sm:col-span-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            ></textarea>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-5">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Provider
        </button>
      </div>
    </form>
  );
}
