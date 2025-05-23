"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, ChevronLeft, Upload, AlertCircle, CheckCircle, XCircle, FileDown } from "lucide-react";

export default function BulkOnboardGranteesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [processedCount, setProcessedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file type (accept CSV or Excel)
      if (selectedFile.type === "text/csv" || 
          selectedFile.type === "application/vnd.ms-excel" || 
          selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        setFile(selectedFile);
        setUploadStatus('idle');
        setValidationErrors([]);
      } else {
        setFile(null);
        setValidationErrors(["Please upload a CSV or Excel file (.csv, .xls, .xlsx)"]);
      }
    }
  };

  // Handle file upload submission
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setValidationErrors(["Please select a file to upload"]);
      return;
    }
    
    setIsUploading(true);
    setUploadStatus('idle');
    setValidationErrors([]);
    
    try {
      // Create form data and append file
      const formData = new FormData();
      formData.append('file', file);
      
      // Send to API endpoint
      const response = await fetch('/api/grantees/bulk-upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle validation errors from API
        setUploadStatus('error');
        if (data.errors && Array.isArray(data.errors)) {
          setValidationErrors(data.errors);
        } else {
          setValidationErrors([data.error || "Failed to process file"]);
        }
        return;
      }
      
      // Success case
      setProcessedCount(data.successful || 0);
      setErrorCount(data.failed || 0);
      setUploadStatus('success');
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus('error');
      setValidationErrors(["There was an error uploading your file. Please try again."]);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle download sample template
  const handleDownloadTemplate = () => {
    // Redirect to the GET endpoint of our bulk-upload API to download the template
    window.location.href = '/api/grantees/bulk-upload';
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link 
            href="/grantees" 
            className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Grantees
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-500" />
            Bulk Onboard Grantees
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Upload Grantee Data</h2>
              </div>
              
              <form onSubmit={handleUpload} className="p-6">
                <div className="space-y-6">
                  {/* File Upload Zone */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center ${
                      file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <Upload className={`h-12 w-12 mb-4 ${file ? 'text-blue-500' : 'text-gray-400'}`} />
                    
                    {!file ? (
                      <>
                        <p className="text-base font-medium text-gray-900">Drag and drop your file here, or</p>
                        <label className="mt-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
                          <span>Select File</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={handleFileChange}
                            accept=".csv,.xls,.xlsx"
                          />
                        </label>
                        <p className="mt-2 text-sm text-gray-500">Supported formats: .csv, .xls, .xlsx</p>
                      </>
                    ) : (
                      <>
                        <p className="text-base font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        <button 
                          type="button" 
                          className="mt-2 text-red-600 hover:text-red-800 font-medium"
                          onClick={() => setFile(null)}
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <XCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">There were errors with your submission</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <ul className="list-disc pl-5 space-y-1">
                              {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Success Message */}
                  {uploadStatus === 'success' && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">File processed successfully</h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>Successfully processed {processedCount} grantees.</p>
                            {errorCount > 0 && (
                              <p className="mt-1">Found {errorCount} records with errors that were skipped.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Upload Error Message */}
                  {uploadStatus === 'error' && !validationErrors.length && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <XCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Upload failed</h3>
                          <p className="mt-2 text-sm text-red-700">
                            There was an error processing your file. Please try again.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Download Template
                    </button>
                    <button
                      type="submit"
                      disabled={!file || isUploading}
                      className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                        !file || isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? 'Processing...' : 'Upload & Process'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          {/* Information Panel */}
          <div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Instructions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">1. Prepare Your Data</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Ensure your CSV or Excel file follows the required format. Download our template for guidance.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">2. Required Fields</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      The following fields are required for each grantee:
                    </p>
                    <ul className="mt-2 text-sm text-gray-500 list-disc pl-5 space-y-1">
                      <li>Name (Full legal name)</li>
                      <li>Gender</li>
                      <li>Contact Number</li>
                      <li>Sector/Venture Type</li>
                      <li>Location (Village, District, State)</li>
                      <li>ID Type (Aadhaar, Voter ID, etc.)</li>
                      <li>ID Number</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">3. Processing</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      After uploading, our system will validate each row and create grantee records. 
                      You'll receive a summary of successful imports and any errors.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">4. Grant Assignment</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      After grantees are imported, you can assign them to specific grant programs 
                      from the Grantee List page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Information Alert */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Bulk onboarding is ideal for importing large numbers of grantees from existing data sources. 
                For individual grantees, use the <Link href="/grantees/new" className="font-medium underline">Add Grantee</Link> form instead.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
