import { useState } from "react";
import { Paperclip, X, File, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { DocumentData, FormErrors, DocumentRecord } from "@/types/grantee";

// Document types for grantees
const DOCUMENT_TYPES = [
  "ID Proof",
  "Address Proof",
  "Business Plan",
  "Photo",
  "Bank Statement",
  "Income Proof",
  "Other"
];

interface GranteeDocumentsFormProps {
  documents: DocumentData[];
  setDocuments: (documents: DocumentData[]) => void;
  errors: FormErrors;
  granteeId?: string; // Optional - only needed for existing grantees
  onDocumentUpload?: (document: any) => void; // Callback when upload is successful
}

const GranteeDocumentsForm = ({ 
  documents, 
  setDocuments, 
  errors = {}, 
  granteeId,
  onDocumentUpload 
}: GranteeDocumentsFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [activeDocumentIndex, setActiveDocumentIndex] = useState<number | null>(null);
  // Add a new document slot
  const addDocumentSlot = () => {
    setDocuments([
      ...documents,
      { type: "Other", file: null, description: "" }
    ]);
  };

  // Remove a document slot
  const removeDocumentSlot = (index: number) => {
    const updatedDocs = [...documents];
    updatedDocs.splice(index, 1);
    setDocuments(updatedDocs);
  };

  // Update document slot data
  const updateDocumentData = (index: number, field: string, value: any) => {
    const updatedDocs = [...documents];
    updatedDocs[index] = {
      ...updatedDocs[index],
      [field]: value
    };
    setDocuments(updatedDocs);
  };

  // Handle file selection
  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateDocumentData(index, "file", e.target.files[0]);
    }
  };
  
  // Handle document upload to server
  const handleUpload = async (index: number) => {
    const doc = documents[index];
    if (!doc.file) {
      setUploadError("Please select a file to upload");
      return;
    }
    
    setIsUploading(true);
    setActiveDocumentIndex(index);
    setUploadError("");
    setUploadSuccess("");
    
    try {
      // Step 1: Upload the file
      const formData = new FormData();
      formData.append('file', doc.file);
      formData.append('entityType', 'grantee');
      formData.append('entityId', granteeId || 'new');
      formData.append('documentType', doc.type);
      
      const uploadResponse = await fetch('/api/uploads', {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Failed to upload file');
      }
      
      const uploadResult = await uploadResponse.json();
      
      // Step 2: If we have a granteeId, associate the document with the grantee
      if (granteeId) {
        const docResponse = await fetch(`/api/grantees/${granteeId}/documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: doc.description || doc.file.name,
            type: doc.type,
            fileUrl: uploadResult.file.url
          })
        });
        
        if (!docResponse.ok) {
          const error = await docResponse.json();
          throw new Error(error.error || 'Failed to associate document with grantee');
        }
        
        const document = await docResponse.json();
        
        // Update the document in state
        const updatedDocs = [...documents];
        updatedDocs[index] = {
          ...updatedDocs[index],
          uploaded: true,
          id: document.id,
          url: uploadResult.file.url
        };
        setDocuments(updatedDocs);
        
        // Call the callback if provided
        if (onDocumentUpload) {
          onDocumentUpload(document);
        }
      } else {
        // For new grantees, just update the documents array with the URL
        const updatedDocs = [...documents];
        updatedDocs[index] = {
          ...updatedDocs[index],
          uploaded: true,
          url: uploadResult.file.url
        };
        setDocuments(updatedDocs);
      }
      
      setUploadSuccess("Document uploaded successfully");
    } catch (error) {
      console.error("Error uploading document:", error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  // Get file size in readable format
  const getFileSize = (file: File) => {
    if (!file) return "";
    
    const sizeInKB = file.size / 1024;
    if (sizeInKB < 1024) {
      return `${sizeInKB.toFixed(1)} KB`;
    } else {
      return `${(sizeInKB / 1024).toFixed(1)} MB`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900">Documents</h2>
        <p className="text-sm text-gray-500">Upload relevant documents for the grantee</p>
      </div>

      <div className="space-y-4">
        {documents.map((doc, index) => (
          <div 
            key={index}
            className="p-4 border border-gray-200 rounded-md bg-gray-50"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-gray-900">Document {index + 1}</h4>
              {documents.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDocumentSlot(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Document Type */}
              <div>
                <label 
                  htmlFor={`doc-type-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Document Type
                </label>
                <select
                  id={`doc-type-${index}`}
                  value={doc.type}
                  onChange={(e) => updateDocumentData(index, "type", e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label 
                  htmlFor={`doc-desc-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <input
                  type="text"
                  id={`doc-desc-${index}`}
                  value={doc.description}
                  onChange={(e) => updateDocumentData(index, "description", e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Brief description of the document"
                />
              </div>

              {/* File Upload */}
              <div className="md:col-span-2">
                <label 
                  htmlFor={`doc-file-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  File
                </label>
                
                {doc.uploaded && doc.url && (
                  <div className="mb-2 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-green-600">Document uploaded</span>
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-sm text-blue-600 underline"
                    >
                      View Document
                    </a>
                  </div>
                )}
                
                {!doc.file && !doc.uploaded ? (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
                    <div className="space-y-1 text-center">
                      <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor={`doc-file-${index}`}
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id={`doc-file-${index}`}
                            name={`doc-file-${index}`}
                            type="file"
                            className="sr-only"
                            onChange={(e) => handleFileChange(index, e)}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                ) : doc.file && (
                  <div className="flex items-center mt-2 p-3 bg-white border border-gray-300 rounded-md">
                    <File className="h-6 w-6 text-blue-500 mr-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.file.name}
                      </p>
                      <p className="text-xs text-gray-500">{getFileSize(doc.file)}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                      {granteeId && (
                        <button
                          type="button"
                          onClick={() => handleUpload(index)}
                          disabled={isUploading && activeDocumentIndex === index}
                          className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white ${isUploading && activeDocumentIndex === index ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                          {isUploading && activeDocumentIndex === index ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="-ml-0.5 mr-1 h-4 w-4" />
                              Upload
                            </>
                          )}
                        </button>
                      )}
                      <button 
                        type="button" 
                        onClick={() => updateDocumentData(index, "file", null)}
                        className="font-medium text-red-600 hover:text-red-500 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Add another document button */}
        <div>
          <button
            type="button"
            onClick={addDocumentSlot}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Paperclip className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Add Another Document
          </button>
        </div>

        {/* Error and success messages */}
        {uploadError && (
          <div className="rounded-md bg-red-50 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{uploadError}</h3>
              </div>
            </div>
          </div>
        )}

        {uploadSuccess && (
          <div className="rounded-md bg-green-50 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{uploadSuccess}</h3>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GranteeDocumentsForm;
