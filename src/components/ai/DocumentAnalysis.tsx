"use client";

import { useState } from "react";
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function DocumentAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFileType(droppedFile)) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Please upload a PDF, DOC, DOCX, or TXT file.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFileType(selectedFile)) {
      setFile(selectedFile);
      setError(null);
    } else if (selectedFile) {
      setError("Please upload a PDF, DOC, DOCX, or TXT file.");
    }
  };

  const isValidFileType = (file: File) => {
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    return validTypes.includes(file.type);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setAnalysis(null);
  };

  const [modelUsed, setModelUsed] = useState<string>("");

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Call our API endpoint
      const response = await fetch('/api/ai/document-analysis', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze document');
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Set the model used if available
      if (result.model) {
        setModelUsed(result.model);
      }
      
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing document:', error);
      setError('Failed to analyze document. Please try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
          <FileText className="h-5 w-5 text-blue-500 mr-2" />
          AI Document Analysis
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload grant proposals, reports, or other documents for AI analysis
        </p>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        {!file && !analysis && (
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="rounded-full bg-blue-100 p-3">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">
                  Drag and drop your document here, or
                </p>
                <div className="mt-2">
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  >
                    Browse Files
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Supported file types: PDF, DOC, DOCX, TXT (Max 5MB)
                </p>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}
        
        {file && !analysis && !isAnalyzing && (
          <div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  {modelUsed && (
                    <span className="ml-2 text-xs text-blue-500">
                      Will use {modelUsed.split('/').pop()}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <button
              onClick={handleAnalyze}
              className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Analyze Document
            </button>
          </div>
        )}
        
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-4 text-sm text-gray-500">
              Analyzing document content...
            </p>
          </div>
        )}
        
        {analysis && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <h4 className="font-medium text-gray-900">Analysis Complete</h4>
                {modelUsed && (
                  <span className="ml-2 text-xs text-gray-500">
                    Powered by {modelUsed.split('/').pop()}
                  </span>
                )}
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Analyze Another Document
              </button>
            </div>
            
            {/* Document Type */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Document Type</p>
              <p className="text-lg font-medium">{analysis.documentType}</p>
            </div>
            
            {/* Summary */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Summary</h5>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">{analysis.summary}</p>
              </div>
            </div>
            
            {/* Key Insights */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Key Insights</h5>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {analysis.keyInsights.map((insight: string, index: number) => (
                    <li key={index} className="text-sm text-gray-700 flex">
                      <span className="text-blue-500 mr-2">•</span> {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Entities */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Entities Detected</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Organizations</p>
                  <ul className="space-y-1">
                    {analysis.entities.organizations.map((org: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700">{org}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Locations</p>
                  <ul className="space-y-1">
                    {analysis.entities.locations.map((location: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700">{location}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">People</p>
                  <ul className="space-y-1">
                    {analysis.entities.people.map((person: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700">{person}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Sentiment */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Document Sentiment</h5>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                <div className="w-full">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">Negative</span>
                    <span className="text-xs text-gray-500">Positive</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ width: `${analysis.sentiment.score * 100}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-sm font-medium text-green-600 text-right">
                    {analysis.sentiment.label} ({(analysis.sentiment.score * 100).toFixed(0)}%)
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recommended Actions */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Recommended Actions</h5>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <ul className="space-y-2">
                  {analysis.recommendedActions.map((action: string, index: number) => (
                    <li key={index} className="text-sm flex items-start">
                      <CheckCircle className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
