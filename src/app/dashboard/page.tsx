"use client";

import { useState, useEffect, ReactNode, useMemo, memo } from "react";
import {
  BarChart3,
  DollarSign,
  Users,
  Award,
  Briefcase,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/DashboardLayout";

// TypeScript interfaces
interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  isLoading?: boolean;
}

interface TabButtonProps {
  id: string;
  label: string;
  active: boolean;
  onClick: (id: string) => void;
}

interface StatsData {
  totalGrants: number;
  activeGrants: number;
  activePrograms: number;
  disbursedAmount: number;
  serviceProviders: number;
}

interface Activity {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  date: string;
  amount?: number;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [dateRange, setDateRange] = useState<string>('last30days');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<StatsData>({
    totalGrants: 0,
    activeGrants: 0,
    activePrograms: 0,
    disbursedAmount: 0,
    serviceProviders: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isEmpty, setIsEmpty] = useState<boolean>(true);

  // Fetch dashboard data directly from the database
  // Error handler for fetch operations
  const handleFetchError = (error: any) => {
    console.error('Error fetching dashboard data:', error);
    toast.error('Failed to load dashboard data');
    setIsLoading(false);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/dashboard?dateRange=${dateRange}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setStats(data.stats);
        setActivities(data.recentActivities || []);
        setIsEmpty(data.isEmpty || false);
      } catch (error) {
        handleFetchError(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [dateRange]);
  
  // Simple stat card component - Performance optimized with memo
  const StatCard = memo(({ 
    title, 
    value, 
    icon, 
    isLoading = false
  }: StatCardProps) => {
    return (
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="p-2 rounded-md bg-gray-50">{icon}</div>
        </div>
        
        <div className="flex items-baseline mb-1">
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <span className="text-2xl font-bold text-gray-900">{value}</span>
          )}
        </div>
      </div>
    );
  });

  // Tab Button component - Performance optimized with memo
  const TabButton = memo(({ id, label, active, onClick }: TabButtonProps) => {
    return (
      <button
        onClick={() => onClick(id)}
        className={`px-4 py-2 text-sm font-medium rounded-md ${active 
          ? "bg-blue-100 text-blue-800 font-medium" 
          : "text-gray-600 hover:text-gray-800"}`}
      >
        {label}
      </button>
    );
  });

  // Format currency function
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) { // 1 Cr+
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) { // 1L+
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) { // 1K+
      return `₹${(amount / 1000).toFixed(1)}K`;
    } else {
      return `₹${amount.toFixed(0)}`;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Memoize formatted stats to prevent unnecessary recalculations
  const formattedStats = useMemo(() => {
    return {
      totalGrants: stats.totalGrants,
      activeGrants: stats.activeGrants,
      activePrograms: stats.activePrograms,
      disbursedAmount: formatCurrency(stats.disbursedAmount),
      serviceProviders: stats.serviceProviders
    };
  }, [stats]);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            <BarChart3 className="inline-block mr-2 h-6 w-6 text-blue-500" />
            Analytics Dashboard
          </h1>

          <div className="flex items-center space-x-2">
            <select 
              className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              disabled={isLoading}
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 days</option>
              <option value="last30days">Last 30 days</option>
              <option value="thisMonth">This month</option>
            </select>
          </div>
        </div>
        
        {isEmpty && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-md shadow-sm transition-all duration-300 hover:shadow-md" data-component-name="Dashboard">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div data-component-name="Dashboard">
                <h3 className="text-sm font-medium text-amber-800" data-component-name="Dashboard">Database is Empty</h3>
                <div className="mt-1 text-sm text-amber-700">
                  <p data-component-name="Dashboard">Your database does not contain any records. Add grants, programs, and service providers to see actual data.</p>
                  <div className="mt-3">
                    <a href="/grants/new" className="text-sm font-medium text-amber-800 hover:text-amber-600 transition-colors duration-200">
                      Create your first grant →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Grants" 
            value={formattedStats.totalGrants} 
            icon={<Award className="h-5 w-5 text-blue-500" />}
            isLoading={isLoading}
          />
          <StatCard 
            title="Active Programs" 
            value={formattedStats.activePrograms} 
            icon={<Briefcase className="h-5 w-5 text-green-500" />}
            isLoading={isLoading}
          />
          <StatCard 
            title="Disbursed Amount" 
            value={formattedStats.disbursedAmount} 
            icon={<DollarSign className="h-5 w-5 text-amber-500" />}
            isLoading={isLoading}
          />
          <StatCard 
            title="Service Providers" 
            value={formattedStats.serviceProviders} 
            icon={<Users className="h-5 w-5 text-purple-500" />}
            isLoading={isLoading}
          />
        </div>

        {/* Tabs */}
        <div className="mb-4 flex space-x-2">
          <TabButton 
            id="overview" 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="grants" 
            label="Grants" 
            active={activeTab === 'grants'} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="programs" 
            label="Programs" 
            active={activeTab === 'programs'} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="service-providers" 
            label="Service Providers" 
            active={activeTab === 'service-providers'} 
            onClick={setActiveTab} 
          />
        </div>

        {/* Tab Content */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6 transition-all duration-300 hover:shadow-md">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-lg font-medium mb-4">Overview Dashboard</h2>
              <div>
                <p>Current data from database:</p>
                <ul className="list-disc ml-5 mt-2">
                  <li>Total Grants: <span className="font-medium">{formattedStats.totalGrants}</span></li>
                  <li>Active Grants: <span className="font-medium">{formattedStats.activeGrants}</span></li>
                  <li>Active Programs: <span className="font-medium">{formattedStats.activePrograms}</span></li>
                  <li>Total Disbursed: <span className="font-medium">{formattedStats.disbursedAmount}</span></li>
                  <li>Service Providers: <span className="font-medium">{formattedStats.serviceProviders}</span></li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'grants' && (
            <div>
              <h2 className="text-lg font-medium mb-4">Grants Analysis</h2>
              <div>
                <p>Grants data from database:</p>
                <ul className="list-disc ml-5 mt-2">
                  <li>Total Grants: <span className="font-medium">{formattedStats.totalGrants}</span></li>
                  <li>Active Grants: <span className="font-medium">{formattedStats.activeGrants}</span></li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'programs' && (
            <div>
              <h2 className="text-lg font-medium mb-4">Programs Performance</h2>
              <div>
                <p>Programs data from database:</p>
                <ul className="list-disc ml-5 mt-2">
                  <li>Active Programs: <span className="font-medium">{formattedStats.activePrograms}</span></li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'service-providers' && (
            <div>
              <h2 className="text-lg font-medium mb-4">Service Providers</h2>
              <div>
                <p>Service Providers data from database:</p>
                <ul className="list-disc ml-5 mt-2">
                  <li>Total Service Providers: <span className="font-medium">{formattedStats.serviceProviders}</span></li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Activities</h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex animate-pulse">
                  <div className="mr-4">
                    <div className={`h-10 w-10 rounded-full ${i % 2 === 0 ? 'bg-blue-100' : 'bg-green-100'}`}>
                      <div className="h-4 w-4 mx-auto mt-3 rounded-full bg-gray-200"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {activities.length === 0 ? (
                <div className="py-4">
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">Activities will appear here as you add data</p>
                    <p className="mt-1">Grant approvals, program updates, and other activities will be shown in this timeline.</p>
                    <div className="mt-3 flex justify-start space-x-4">
                      <a href="/grants/new" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200">
                        Create a Grant
                      </a>
                      <a href="/programs/new" className="text-sm font-medium text-green-600 hover:text-green-800 transition-colors duration-200">
                        Add a Program
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="py-4 flex">
                    <div className="mr-4">
                      <div className={`p-2 rounded-full ${activity.type === 'grant' ? 'bg-blue-100' : 'bg-green-100'}`}>
                        {activity.type === 'grant' ? (
                          <Award className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Briefcase className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.subtitle} • {formatDate(activity.date)}
                      </p>
                    </div>
                    {activity.amount && (
                      <div className="ml-4 text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(activity.amount)}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
