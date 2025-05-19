"use client";

import React, { useState } from 'react';
import { Paperclip, Upload, File, X } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate?: string;
}

interface DocsTabProps {
  initialDocuments?: Document[];
  readOnly?: boolean;
}

export default function DocsTab({ initialDocuments = [], readOnly = false }: DocsTabProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [dragActive, setDragActive] = useState(false);

  // Simulate file upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const newDocs: Document[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileSize = file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
        
      newDocs.push({
        id: `doc-${Date.now()}-${i}`,
        name: file.name,
        type: file.type,
        size: fileSize,
        uploadDate: new Date().toISOString().split('T')[0]
      });
    }
    
    setDocuments([...documents, ...newDocs]);
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Remove a document
  const removeDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Program Documents</h2>
        <p className="text-sm text-gray-500">
          Upload program-related documents such as guidelines, reports, and templates
        </p>
      </div>
      
      {!readOnly && (
        <div 
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <Paperclip className={`h-12 w-12 mb-4 ${dragActive ? "text-blue-500" : "text-gray-400"}`} />
          <p className="text-base font-medium text-gray-900">Drag and drop your files here, or</p>
          <label className="mt-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
            <span>Browse Files</span>
            <input 
              type="file" 
              className="hidden" 
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </label>
          <p className="mt-2 text-sm text-gray-500">Upload multiple files up to 10MB each</p>
        </div>
      )}
      
      {documents.length === 0 ? (
        <div className="bg-gray-50 p-4 text-center rounded-md">
          <p className="text-gray-500">No documents have been uploaded yet.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <li key={doc.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <File className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.size} • {doc.uploadDate}</p>
                    </div>
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
