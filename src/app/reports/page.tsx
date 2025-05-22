"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import ReportFilters from "@/components/dashboard/reporting/ReportFilters";
import ReportBuilder from "@/components/reports/ReportBuilder";
import { 
  BarChart3, 
  FileText, 
  Download, 
  Users, 
  CreditCard, 
  Briefcase, 
  Calendar, 
  DollarSign,
  FileBarChart,
  MapPin,
  Mail,
  FileQuestion,
  Settings
} from "lucide-react";

export default function ReportsPage() {
  const [activeFilters, setActiveFilters] = useState({});
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [reportData, setReportData] = useState([]);
  
  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    console.log("Applied filters:", filters);
  };
  
  const openReportBuilder = () => {
    // In a real app, we would fetch data for the report here
    // For demo purposes, we're using empty data
    setReportData([]);
    setShowReportBuilder(true);
  };
  
  const closeReportBuilder = () => {
    setShowReportBuilder(false);
  };
  
  // Report categories and individual reports
  const reportCategories = [
    {
      name: "Financial Reports",
      icon: <DollarSign className="h-6 w-6 text-green-500" />,
      reports: [
        {
          id: "disbursement-report",
          name: "Grant Disbursement Report",
          description: "Track grant disbursements by program, timeframe, and region",
          icon: <CreditCard className="h-5 w-5" />,
          path: "/reports/financial/disbursements"
        },
        {
          id: "repayment-report",
          name: "Repayment Analysis Report",
          description: "Analyze repayment rates, trends, and forecasts",
          icon: <BarChart3 className="h-5 w-5" />,
          path: "/reports/financial/repayments"
        },
        {
          id: "ledger-report",
          name: "Complete Ledger Report",
          description: "Comprehensive financial transactions and balances",
          icon: <FileText className="h-5 w-5" />,
          path: "/reports/financial/ledger"
        }
      ]
    },
    {
      name: "Grantee Reports",
      icon: <Users className="h-6 w-6 text-blue-500" />,
      reports: [
        {
          id: "grantee-demographics",
          name: "Grantee Demographics Report",
          description: "Insights on grantee distribution by gender, age, and social groups",
          icon: <FileBarChart className="h-5 w-5" />,
          path: "/reports/grantees/demographics"
        },
        {
          id: "grantee-performance",
          name: "Grantee Performance Report",
          description: "Track business growth, repayment compliance, and outcomes",
          icon: <BarChart3 className="h-5 w-5" />,
          path: "/reports/grantees/performance"
        },
        {
          id: "grantee-geographical",
          name: "Geographical Distribution Report",
          description: "Map-based visualization of grantee locations",
          icon: <MapPin className="h-5 w-5" />,
          path: "/reports/grantees/geographical"
        }
      ]
    },
    {
      name: "Program Reports",
      icon: <Briefcase className="h-6 w-6 text-purple-500" />,
      reports: [
        {
          id: "program-performance",
          name: "Program Performance Report",
          description: "Measure program achievements against goals and indicators",
          icon: <BarChart3 className="h-5 w-5" />,
          path: "/reports/programs/performance"
        },
        {
          id: "milestone-tracking",
          name: "Milestone Tracking Report",
          description: "Track program milestones and completion status",
          icon: <Calendar className="h-5 w-5" />,
          path: "/reports/programs/milestones"
        },
        {
          id: "donor-reporting",
          name: "Donor Reporting",
          description: "Pre-formatted donor reports for each program",
          icon: <Mail className="h-5 w-5" />,
          path: "/reports/programs/donor"
        }
      ]
    },
    {
      name: "Custom Reports",
      icon: <FileQuestion className="h-6 w-6 text-orange-500" />,
      reports: [
        {
          id: "create-custom",
          name: "Create Custom Report",
          description: "Build your own report with selected metrics and dimensions",
          icon: <FileBarChart className="h-5 w-5" />,
          path: "/reports/custom/new"
        }
      ]
    }
  ];

  // If report builder is open, show that instead of the reports list
  if (showReportBuilder) {
    return (
      <DashboardLayout>
        <ReportBuilder 
          initialData={reportData} 
          onClose={closeReportBuilder} 
        />
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center mb-4 md:mb-0">
            <FileText className="h-6 w-6 mr-2 text-blue-600" />
            Reports & Analytics
          </h1>

          <div className="flex space-x-3">
            <button 
              onClick={openReportBuilder}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              Custom Report Builder
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        <ReportFilters onApplyFilters={handleApplyFilters} />

        {/* Report Categories */}
        <div className="space-y-8">
          {reportCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                {category.icon}
                <span className="ml-2">{category.name}</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.reports.map((report) => (
                  <Link 
                    key={report.id} 
                    href={report.path}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
                          {report.icon}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                          <p className="mt-1 text-sm text-gray-500">{report.description}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-end text-sm">
                        <span className="font-medium text-blue-600 hover:text-blue-500 flex items-center">
                          View Report
                          <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
