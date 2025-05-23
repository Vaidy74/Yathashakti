"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { Heart, ChevronLeft, Plus, Trash2, Upload, Check, AlertCircle } from "lucide-react";

// Types
interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

interface Document {
  id: string;
  label: string;
  file: File | null;
  fileName: string;
}

export default function AddDonorPage() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "INDIVIDUAL", // Default to Individual
    keyContact: "",
    keyContactRole: "",
    email: "",
    phone: "",
    address: "",
    onboardingDate: new Date().toISOString().slice(0, 10) // Current date as default
  });
  
  // Additional contacts state
  const [contacts, setContacts] = useState<Contact[]>([]);
  
  // Documents state
  const [documents, setDocuments] = useState<Document[]>([]);
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Handle main form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Add a new contact
  const addContact = () => {
    setContacts(prev => [
      ...prev, 
      { id: `contact-${Date.now()}`, name: "", role: "", email: "", phone: "" }
    ]);
  };

  // Remove a contact
  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
  };

  // Update contact information
  const updateContact = (id: string, field: string, value: string) => {
    setContacts(prev => 
      prev.map(contact => 
        contact.id === id 
          ? { ...contact, [field]: value }
          : contact
      )
    );
    
    // Clear contact error if exists
    if (formErrors[`contact-${id}`]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`contact-${id}`];
        return newErrors;
      });
    }
  };

  // Add a new document
  const addDocument = () => {
    setDocuments(prev => [
      ...prev,
      { id: `doc-${Date.now()}`, label: "", file: null, fileName: "" }
    ]);
  };

  // Remove a document
  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  // Update document information
  const updateDocument = (id: string, field: string, value: string | File | null) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id 
          ? { ...doc, [field]: value }
          : doc
      )
    );
    
    // If file was updated, also update the fileName
    if (field === 'file' && value instanceof File) {
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === id 
            ? { ...doc, fileName: value.name }
            : doc
        )
      );
    }
    
    // Clear document error if exists
    if (formErrors[`doc-${id}`]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`doc-${id}`];
        return newErrors;
      });
    }
  };

  // Handle file selection
  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateDocument(id, 'file', e.target.files[0]);
    }
  };

  // Validate the form
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Validate required fields
    if (!formData.name.trim()) {
      errors.name = "Donor name is required";
    }
    
    if (formData.type === "LEGAL_ENTITY") {
      if (!formData.keyContact.trim()) {
        errors.keyContact = "Key contact person is required for legal entities";
      }
      if (!formData.keyContactRole.trim()) {
        errors.keyContactRole = "Role of key contact person is required for legal entities";
      }
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }
    
    // Validate additional contacts
    contacts.forEach(contact => {
      if (contact.name.trim() === "") {
        errors[`contact-${contact.id}`] = "Contact name is required";
      }
      
      if (contact.email && !/^\S+@\S+\.\S+$/.test(contact.email)) {
        errors[`contact-${contact.id}-email`] = "Please enter a valid email";
      }
    });
    
    // Validate documents
    documents.forEach(doc => {
      if (doc.label.trim() === "") {
        errors[`doc-${doc.id}`] = "Document label is required";
      }
    });
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real application, this would be an API call to save the donor
      // For now, we'll simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Form submitted with:", {
        formData,
        contacts,
        documents
      });
      
      // Show success message
      setShowSuccess(true);
      
      // Redirect after a delay
      setTimeout(() => {
        router.push("/donors");
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link 
            href="/donors" 
            className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Donors
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Heart className="h-6 w-6 mr-2 text-red-500" />
            Add New Donor
          </h1>
        </div>

        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative flex items-center">
            <Check className="h-5 w-5 mr-2" />
            <span>Donor added successfully! Redirecting...</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Donor Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Donor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full border ${formErrors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Donor Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="LEGAL_ENTITY">Legal Entity</option>
                  </select>
                </div>

                {formData.type === "LEGAL_ENTITY" && (
                  <>
                    <div>
                      <label htmlFor="keyContact" className="block text-sm font-medium text-gray-700 mb-1">
                        Key Contact Person <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="keyContact"
                        name="keyContact"
                        value={formData.keyContact}
                        onChange={handleChange}
                        className={`block w-full border ${formErrors.keyContact ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        required={formData.type === "LEGAL_ENTITY"}
                      />
                      {formErrors.keyContact && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.keyContact}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="keyContactRole" className="block text-sm font-medium text-gray-700 mb-1">
                        Role of Key Contact Person <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="keyContactRole"
                        name="keyContactRole"
                        value={formData.keyContactRole}
                        onChange={handleChange}
                        className={`block w-full border ${formErrors.keyContactRole ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        required={formData.type === "LEGAL_ENTITY"}
                      />
                      {formErrors.keyContactRole && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.keyContactRole}</p>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full border ${formErrors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="onboardingDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Onboarding Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="onboardingDate"
                    name="onboardingDate"
                    value={formData.onboardingDate}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Contacts Section */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-800">Additional Contacts</h2>
                <button
                  type="button"
                  onClick={addContact}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Contact
                </button>
              </div>

              {contacts.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No additional contacts added.</p>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="border border-gray-200 rounded-md p-4 relative">
                      <button
                        type="button"
                        onClick={() => removeContact(contact.id)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={contact.name}
                            onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                            className={`block w-full border ${formErrors[`contact-${contact.id}`] ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                            required
                          />
                          {formErrors[`contact-${contact.id}`] && (
                            <p className="mt-1 text-sm text-red-600">{formErrors[`contact-${contact.id}`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Role
                          </label>
                          <input
                            type="text"
                            value={contact.role}
                            onChange={(e) => updateContact(contact.id, 'role', e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Email
                          </label>
                          <input
                            type="email"
                            value={contact.email}
                            onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                            className={`block w-full border ${formErrors[`contact-${contact.id}-email`] ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                          />
                          {formErrors[`contact-${contact.id}-email`] && (
                            <p className="mt-1 text-sm text-red-600">{formErrors[`contact-${contact.id}-email`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Phone
                          </label>
                          <input
                            type="tel"
                            value={contact.phone}
                            onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents Section */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-800">Onboarding Documents</h2>
                <button
                  type="button"
                  onClick={addDocument}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Document
                </button>
              </div>

              {documents.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No documents added.</p>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded-md p-4 relative">
                      <button
                        type="button"
                        onClick={() => removeDocument(doc.id)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Document Label <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={doc.label}
                            onChange={(e) => updateDocument(doc.id, 'label', e.target.value)}
                            className={`block w-full border ${formErrors[`doc-${doc.id}`] ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                            required
                          />
                          {formErrors[`doc-${doc.id}`] && (
                            <p className="mt-1 text-sm text-red-600">{formErrors[`doc-${doc.id}`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            File
                          </label>
                          <div className="flex items-center">
                            <label
                              htmlFor={`file-${doc.id}`}
                              className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Choose File
                            </label>
                            <input
                              id={`file-${doc.id}`}
                              type="file"
                              onChange={(e) => handleFileChange(doc.id, e)}
                              className="hidden"
                            />
                            {doc.fileName && (
                              <span className="ml-3 text-sm text-gray-500 truncate max-w-xs">
                                {doc.fileName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Submission */}
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Fields marked with <span className="text-red-500">*</span> are required</span>
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/donors"
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {isSubmitting ? "Saving..." : "Save Donor"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
