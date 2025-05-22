"use client";

import { useState, useEffect } from "react";
import { ServiceProviderDocument } from "@/types/service-provider";
import { 
  FileText, 
  Download, 
  Trash2, 
  AlertCircle, 
  Loader2, 
  File,
  FileSpreadsheet,
  FileImage,
  FilePieChart,
  FileText as FileTextIcon,
  FileType
} from "lucide-react";
import toast from "react-hot-toast";
// Define formatDate function directly to avoid dependency on external module
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

interface ServiceProviderDocumentListProps {
  serviceProviderId: string;
  refreshTrigger: number;
}

const ServiceProviderDocumentList = ({ 
  serviceProviderId,
  refreshTrigger 
}: ServiceProviderDocumentListProps) => {
  const [documents, setDocuments] = useState<ServiceProviderDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/service-providers/${serviceProviderId}/documents`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch documents: ${response.statusText}`);
        }
        
        const data = await response.json();
        setDocuments(data);
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch documents");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [serviceProviderId, refreshTrigger]);

  const getFileIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PDF':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'WORD':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'EXCEL':
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
      case 'CSV':
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
      case 'PRESENTATION':
        return <FilePieChart className="h-6 w-6 text-orange-500" />;
      case 'IMAGE':
        return <FileImage className="h-6 w-6 text-purple-500" />;
      case 'TEXT':
        return <FileTextIcon className="h-6 w-6 text-gray-500" />;
      default:
        return <FileType className="h-6 w-6 text-gray-500" />;
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(documentId);
    
    try {
      const response = await fetch(`/api/service-providers/${serviceProviderId}/documents/${documentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete document: ${response.statusText}`);
      }
      
      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast.success("Document deleted successfully");
    } catch (err) {
      console.error("Error deleting document:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete document");
    } finally {
      setIsDeleting(null);
    }
  };

  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600">Loading documents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <div className="flex items-center">
          <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
          <div>
            <p className="text-sm text-red-700 font-medium">Error loading documents</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
        <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No documents found</h3>
        <p className="text-gray-500 mb-4">
          This service provider doesn't have any documents yet. Upload a document to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {documents.map(document => (
          <li key={document.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {getFileIcon(document.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <h4 
                    className="text-sm font-medium text-blue-600 cursor-pointer hover:underline truncate"
                    onClick={() => openDocument(document.fileUrl)}
                  >
                    {document.name}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {formatDate(new Date(document.uploadedAt))}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {document.description || "No description provided"}
                </p>
                <div className="mt-2 flex items-center">
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                    {document.type}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center space-x-2">
                <button
                  type="button"
                  className="text-gray-400 hover:text-blue-500 focus:outline-none"
                  onClick={() => openDocument(document.fileUrl)}
                  title="Download"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-500 focus:outline-none disabled:opacity-50"
                  onClick={() => handleDelete(document.id)}
                  disabled={isDeleting === document.id}
                  title="Delete"
                >
                  {isDeleting === document.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceProviderDocumentList;
