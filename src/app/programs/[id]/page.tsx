"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Briefcase,
  ChevronLeft,
  Clock,
  ExternalLink,
  Download,
  FileText,
  BarChart2,
  Users,
  Clipboard,
  DollarSign,
  Calendar,
  Target,
  AlertCircle,
  Edit,
  Share2,
  Archive,
  Info,
} from "lucide-react";

// Tabs for program details
const tabs = [
  { id: "overview", label: "Overview", icon: <Briefcase className="h-4 w-4" /> },
  { id: "metrics", label: "Metrics", icon: <BarChart2 className="h-4 w-4" /> },
  { id: "team", label: "Team", icon: <Users className="h-4 w-4" /> },
  { id: "toc", label: "ToC", icon: <Clipboard className="h-4 w-4" /> },
  { id: "milestones", label: "Milestones", icon: <Calendar className="h-4 w-4" /> },
  { id: "budget", label: "Budget & Funding", icon: <DollarSign className="h-4 w-4" /> },
  { id: "beneficiaries", label: "Beneficiaries", icon: <Target className="h-4 w-4" /> },
  { id: "docs", label: "Documents", icon: <FileText className="h-4 w-4" /> },
];

// Mock program data (in a real app, this would come from an API)
const MOCK_PROGRAM = {
  id: "1",
  name: "Rural Entrepreneurship Initiative",
  status: "LIVE",
  category: "Entrepreneurship",
  startDate: "2025-01-15",
  endDate: "2027-01-15",
  summary: "A comprehensive program to support rural entrepreneurs in developing sustainable businesses through interest-free revolving grants, technical assistance, and market linkages.",
  budget: 3500000,
  utilized: 1200000,
  disbursed: 750000,
  repaid: 125000,
  beneficiaries: {
    total: 45,
    active: 32,
    completed: 8,
    dropped: 5
  },
  grants: {
    total: 38,
    active: 25,
    repaid: 8,
    defaulted: 5
  },
  sdgGoals: [1, 5, 8],
  toc: {
    problemStatement: "Rural communities face limited economic opportunities, forcing youth to migrate to urban areas in search of employment. This leads to economic decline and social fragmentation in villages.",
    longTermGoal: "Create sustainable livelihoods and thriving entrepreneurial ecosystems in rural areas that provide economic opportunities and reduce distress migration.",
    targetPopulation: "Rural youth and women with entrepreneurial potential in agricultural and allied sectors in 15 villages across Rajasthan.",
    activities: "Entrepreneurship training, interest-free revolving grants, business mentoring, and market linkage support.",
    outputs: "45 entrepreneurs trained, 38 revolving grants disbursed, 40 businesses launched, 15 market linkages established.",
    shortTermOutcomes: "Increased entrepreneurial skills, improved access to capital, enhanced business knowledge.",
    mediumTermOutcomes: "Sustainable rural businesses, increased household incomes, reduced migration to urban areas.",
    keyAssumptions: "Rural youth are interested in entrepreneurship, local markets can absorb new businesses, revolving grants will be repaid to create a sustainable fund."
  },
  team: [
    {
      id: "1",
      name: "Priya Sharma",
      role: "Program Manager",
      email: "priya.sharma@example.com",
      phone: "+91 98765 43210",
      organization: "Yathashakti Foundation"
    },
    {
      id: "2", 
      name: "Rahul Mehra",
      role: "Field Coordinator",
      email: "rahul.mehra@example.com",
      phone: "+91 87654 32109",
      organization: "Yathashakti Foundation"
    },
    {
      id: "3",
      name: "Ananya Gupta",
      role: "Grant Manager",
      email: "ananya.gupta@example.com",
      organization: "Yathashakti Foundation"
    }
  ],
  metrics: [
    {
      id: "1",
      name: "Number of businesses launched",
      type: "Numeric",
      frequency: "Quarterly",
      targetValue: "45",
      currentValue: "40",
      status: "On Track"
    },
    {
      id: "2",
      name: "Average monthly income increase",
      type: "Percentage",
      frequency: "Semi-annually",
      targetValue: "30",
      currentValue: "22",
      status: "On Track"
    },
    {
      id: "3",
      name: "Grant repayment rate",
      type: "Percentage",
      frequency: "Monthly",
      targetValue: "85",
      currentValue: "76",
      status: "Needs Attention"
    }
  ],
  milestones: [
    {
      id: "1", 
      title: "Program Launch",
      date: "2025-01-15",
      status: "Completed"
    },
    {
      id: "2",
      title: "First Cohort Training Completed",
      date: "2025-03-30",
      status: "Completed"
    },
    {
      id: "3",
      title: "Mid-term Evaluation",
      date: "2026-01-15",
      status: "Upcoming"
    }
  ],
  documents: [
    {
      id: "1",
      name: "Program Charter",
      type: "PDF",
      uploadedBy: "Priya Sharma",
      uploadedDate: "2024-12-10"
    },
    {
      id: "2",
      name: "Baseline Survey Results",
      type: "XLSX",
      uploadedBy: "Rahul Mehra",
      uploadedDate: "2025-01-25"
    }
  ]
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Get color for status badge
const getStatusColor = (status) => {
  switch (status) {
    case "LIVE":
      return "bg-green-100 text-green-800";
    case "PLANNING":
      return "bg-blue-100 text-blue-800";
    case "ON_HOLD":
      return "bg-yellow-100 text-yellow-800";
    case "CLOSED":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Get formatted status label
const getStatusLabel = (status) => {
  switch (status) {
    case "LIVE":
      return "Live";
    case "PLANNING":
      return "Planning";
    case "ON_HOLD":
      return "On Hold";
    case "CLOSED":
      return "Closed";
    default:
      return status;
  }
};

const ProgramDetailsPage = () => {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [program, setProgram] = useState(MOCK_PROGRAM);
  const [loading, setLoading] = useState(false);
  
  // In a real app, fetch the program data based on the ID
  useEffect(() => {
    // Simulate API call
    setLoading(true);
    
    // Mock API response - in a real app, this would be a fetch call
    setTimeout(() => {
      setLoading(false);
      // No need to set program here since we're using mock data
    }, 500);
  }, [params.id]);
  
  // Handler for tab navigation
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  // Determine if a program is active
  const isProgramActive = program.status === "LIVE";
  
  // Calculate program duration
  const calculateDuration = () => {
    if (!program.startDate) return "Not started";
    
    const start = new Date(program.startDate);
    const end = program.endDate ? new Date(program.endDate) : null;
    
    if (!end) return `Started ${formatDate(program.startDate)}`;
    
    const durationMonths = ((end.getFullYear() - start.getFullYear()) * 12) +
                          (end.getMonth() - start.getMonth());
                          
    return `${durationMonths} month${durationMonths !== 1 ? 's' : ''}`;
  };
  
  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Program Summary Card */}
              <div className="col-span-2 bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-base font-medium text-gray-900">Program Summary</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {program.summary}
                  </p>
                  
                  <h4 className="text-sm font-medium text-gray-900 mt-6 mb-2">
                    Sustainable Development Goals (SDGs)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {program.sdgGoals.map(goal => (
                      <span 
                        key={goal}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        SDG {goal}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Program Stats Card */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-base font-medium text-gray-900">Program Statistics</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-xs text-gray-500">Total Budget</div>
                    <div className="text-lg font-medium text-gray-900">{formatCurrency(program.budget)}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500">Budget Utilized</div>
                    <div className="text-lg font-medium text-gray-900">{formatCurrency(program.utilized)}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(program.utilized / program.budget) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Grants Disbursed</div>
                      <div className="text-lg font-medium text-gray-900">{formatCurrency(program.disbursed)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Grants Repaid</div>
                      <div className="text-lg font-medium text-gray-900">{formatCurrency(program.repaid)}</div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">Total Beneficiaries</div>
                    <div className="text-lg font-medium text-gray-900">{program.beneficiaries.total}</div>
                    <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-xs text-gray-500">Active</div>
                        <div className="text-sm font-medium text-green-700">{program.beneficiaries.active}</div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <div className="text-xs text-gray-500">Completed</div>
                        <div className="text-sm font-medium text-blue-700">{program.beneficiaries.completed}</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">Dropped</div>
                        <div className="text-sm font-medium text-gray-700">{program.beneficiaries.dropped}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Secondary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Key Metrics Card */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-base font-medium text-gray-900">Key Metrics</h3>
                  <button
                    onClick={() => handleTabChange("metrics")}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    View All <ExternalLink className="h-3 w-3 ml-1" />
                  </button>
                </div>
                <div className="p-4">
                  {program.metrics.slice(0, 3).map((metric) => (
                    <div 
                      key={metric.id} 
                      className="py-3 px-4 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium text-gray-900">{metric.name}</div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          metric.status === "On Track" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {metric.status}
                        </span>
                      </div>
                      <div className="flex items-end justify-between mt-1">
                        <div className="text-sm text-gray-500">Target: {metric.targetValue}{metric.type === "Percentage" ? "%" : ""}</div>
                        <div className="text-sm font-medium">Current: {metric.currentValue}{metric.type === "Percentage" ? "%" : ""}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Team Card */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-base font-medium text-gray-900">Team Members</h3>
                  <button
                    onClick={() => handleTabChange("team")}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    View All <ExternalLink className="h-3 w-3 ml-1" />
                  </button>
                </div>
                <div className="p-4">
                  {program.team.map((member) => (
                    <div 
                      key={member.id} 
                      className="py-3 px-4 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.role}</div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {member.email}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Upcoming Milestones Card */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-base font-medium text-gray-900">Upcoming Milestones</h3>
                  <button
                    onClick={() => handleTabChange("milestones")}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    View All <ExternalLink className="h-3 w-3 ml-1" />
                  </button>
                </div>
                <div className="p-4">
                  {program.milestones
                    .filter(m => m.status === "Upcoming")
                    .slice(0, 3)
                    .map((milestone) => (
                      <div 
                        key={milestone.id} 
                        className="py-3 px-4 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="text-sm font-medium text-gray-900">{milestone.title}</div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(milestone.date)}
                        </div>
                      </div>
                    ))}
                  {program.milestones.filter(m => m.status === "Upcoming").length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No upcoming milestones
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Program Notes/Activity */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-base font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="relative">
                  <div className="absolute left-4 top-0 h-full w-px bg-gray-200"></div>
                  <ul className="space-y-6">
                    <li className="relative pl-10">
                      <div className="absolute left-0 top-2 h-8 w-8 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-blue-800">Priya Sharma</span>
                            <span className="text-gray-600"> added a new beneficiary</span>
                          </div>
                          <span className="text-xs text-gray-500">2 days ago</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          Added Meera Kumari as a new program beneficiary and disbursed a revolving grant of ₹25,000.
                        </p>
                      </div>
                    </li>
                    <li className="relative pl-10">
                      <div className="absolute left-0 top-2 h-8 w-8 rounded-full border-2 border-white bg-green-500 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-green-800">System</span>
                            <span className="text-gray-600"> recorded a grant repayment</span>
                          </div>
                          <span className="text-xs text-gray-500">5 days ago</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          Rajesh Kumar made a moral repayment of ₹15,000 towards his revolving grant.
                        </p>
                      </div>
                    </li>
                    <li className="relative pl-10">
                      <div className="absolute left-0 top-2 h-8 w-8 rounded-full border-2 border-white bg-purple-500 flex items-center justify-center">
                        <BarChart2 className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-purple-800">Rahul Mehra</span>
                            <span className="text-gray-600"> updated program metrics</span>
                          </div>
                          <span className="text-xs text-gray-500">1 week ago</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          Updated quarterly metrics based on the latest field data collection.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
        
      // For brevity, we'll only implement the overview tab in detail
      // Other tabs would follow a similar pattern but with their specific content
      case "toc":
        return <div className="p-4">Theory of Change content would go here</div>;
      case "metrics":
        return <div className="p-4">Metrics content would go here</div>;
      case "team":
        return <div className="p-4">Team content would go here</div>;
      case "milestones":
        return <div className="p-4">Milestones content would go here</div>;
      case "budget":
        return <div className="p-4">Budget & Funding content would go here</div>;
      case "beneficiaries":
        return <div className="p-4">Beneficiaries content would go here</div>;
      case "docs":
        return <div className="p-4">Documents content would go here</div>;
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <div className="flex items-center">
              <Link 
                href="/programs" 
                className="mr-3 text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                {program.name}
                <span
                  className={`ml-3 px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    program.status
                  )}`}
                >
                  {getStatusLabel(program.status)}
                </span>
              </h1>
            </div>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <div className="flex items-center mr-4">
                <Calendar className="h-4 w-4 mr-1" />
                Started {formatDate(program.startDate)}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Duration: {calculateDuration()}
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 space-x-2">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
            <Link 
              href={`/programs/${program.id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Program
            </Link>
            {isProgramActive ? (
              <button className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </button>
            ) : null}
          </div>
        </div>
        
        {/* Alert for Example */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                This is an example program overview. In a real implementation, all data would be fetched from the API.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`px-5 py-4 text-sm font-medium flex items-center whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Content */}
          <div>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProgramDetailsPage;
