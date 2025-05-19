"use client";

import { useState } from "react";
import { 
  CreditCard, ClipboardList, MessageSquare, User,
  Calendar, Clock, CheckCircle, AlertCircle, Edit, Printer
} from "lucide-react";
import GrantInfoTab from "./detail-tabs/GrantInfoTab";
import RepaymentTab from "./detail-tabs/RepaymentTab";
import CommunicationTab from "./detail-tabs/CommunicationTab";

interface GrantDetailTabsProps {
  grant: any;
}

export default function GrantDetailTabs({ grant }: GrantDetailTabsProps) {
  const [activeTab, setActiveTab] = useState("info");

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return <GrantInfoTab grant={grant} />;
      case "repayment":
        return <RepaymentTab grant={grant} />;
      case "communication":
        return <CommunicationTab grant={grant} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex overflow-x-auto">
          <button
            className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === "info"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleTabChange("info")}
          >
            <ClipboardList className="h-5 w-5 inline-block mr-2" />
            Grant Information
          </button>
          <button
            className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === "repayment"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleTabChange("repayment")}
          >
            <CreditCard className="h-5 w-5 inline-block mr-2" />
            Repayment Schedule
          </button>
          <button
            className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === "communication"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleTabChange("communication")}
          >
            <MessageSquare className="h-5 w-5 inline-block mr-2" />
            Communication Log
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}
