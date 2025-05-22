"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServiceProviderDocumentUpload from "./ServiceProviderDocumentUpload";
import ServiceProviderDocumentList from "./ServiceProviderDocumentList";
import { FileIcon, UploadIcon } from "lucide-react";

interface ServiceProviderDocumentsProps {
  serviceProviderId: string;
}

const ServiceProviderDocuments = ({ serviceProviderId }: ServiceProviderDocumentsProps) => {
  const [activeTab, setActiveTab] = useState("documents");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Callback for when a document is uploaded
  const handleDocumentUploaded = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab("documents"); // Switch to documents list after uploading
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <Tabs
        defaultValue="documents"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6 grid grid-cols-2 h-auto p-1 w-full max-w-md mx-auto">
          <TabsTrigger
            value="documents"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-2.5 flex items-center justify-center gap-2"
          >
            <FileIcon className="h-4 w-4" />
            <span>Documents</span>
          </TabsTrigger>
          <TabsTrigger
            value="upload"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-2.5 flex items-center justify-center gap-2"
          >
            <UploadIcon className="h-4 w-4" />
            <span>Upload New</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="mt-0">
          <ServiceProviderDocumentList 
            serviceProviderId={serviceProviderId} 
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>
        
        <TabsContent value="upload" className="mt-0">
          <ServiceProviderDocumentUpload
            serviceProviderId={serviceProviderId}
            onDocumentUploaded={handleDocumentUploaded}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceProviderDocuments;
