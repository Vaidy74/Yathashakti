"use client";

import { useState, useRef } from "react";
import { Loader2, Upload, X, FileText, File, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface ServiceProviderDocumentUploadProps {
  serviceProviderId: string;
  onDocumentUploaded: () => void;
}

const ServiceProviderDocumentUpload = ({ 
  serviceProviderId, 
  onDocumentUploaded 
}: ServiceProviderDocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentName, setDocumentName] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      
      // If no name is provided, use the file name
      if (!documentName) {
        setDocumentName(file.name.split('.')[0]);
      }
    }
  };

  const resetForm = () => {
    setDocumentName("");
    setDocumentDescription("");
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    const documentTypes: Record<string, string> = {
      'pdf': 'PDF',
      'doc': 'WORD',
      'docx': 'WORD',
      'xls': 'EXCEL',
      'xlsx': 'EXCEL',
      'ppt': 'PRESENTATION',
      'pptx': 'PRESENTATION',
      'jpg': 'IMAGE',
      'jpeg': 'IMAGE',
      'png': 'IMAGE',
      'txt': 'TEXT',
      'csv': 'CSV',
    };
    
    return documentTypes[extension] || 'OTHER';
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    if (!documentName.trim()) {
      setError("Please provide a document name.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Upload file to /api/uploads endpoint
      const uploadResponse = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
      }

      const uploadData = await uploadResponse.json();
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create document record in the database
      const documentData = {
        name: documentName,
        description: documentDescription || null,
        fileUrl: uploadData.url, // URL returned from the upload endpoint
        type: getFileType(selectedFile.name),
      };

      const createResponse = await fetch(`/api/service-providers/${serviceProviderId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create document record: ${createResponse.statusText}`);
      }

      toast.success("Document uploaded successfully!");
      resetForm();
      onDocumentUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload document");
      console.error("Error uploading document:", err);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Upload className="w-5 h-5 text-blue-500 mr-2" />
        Upload Document
      </h3>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="documentName" className="block text-sm font-medium text-gray-700 mb-1">
            Document Name *
          </label>
          <input
            type="text"
            id="documentName"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter document name"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            disabled={isUploading}
          />
        </div>

        <div>
          <label htmlFor="documentDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="documentDescription"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter document description"
            value={documentDescription}
            onChange={(e) => setDocumentDescription(e.target.value)}
            disabled={isUploading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File *
          </label>
          
          {selectedFile ? (
            <div className="flex items-center p-3 border border-gray-300 rounded-md mb-2">
              <FileText className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm text-gray-600 flex-1 truncate">{selectedFile.name}</span>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-gray-400 hover:text-gray-600"
                disabled={isUploading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <File className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      disabled={isUploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, Word, Excel, PowerPoint, Images up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {isUploading && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              Uploading: {uploadProgress}%
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderDocumentUpload;
