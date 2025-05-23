"use client";

import { useState, ReactNode } from "react";
import {
  BarChart3,
  DollarSign,
  Users,
  Award,
  Briefcase,
  ArrowUp,
  ArrowDown
} from "lucide-react";

// TypeScript interfaces
interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: string | number;
  changeDirection?: 'up' | 'down';
}

interface TabButtonProps {
  id: string;
  label: string;
  active: boolean;
  onClick: (id: string) => void;
}

interface StatsData {
  totalGrants: number;
  activePrograms: number;
  disbursedAmount: number;
  serviceProviders: number;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Mock stats data
  const stats: StatsData = {
    totalGrants: 143,
    activePrograms: 26,
    disbursedAmount: 7200000, // 7.2 Cr
    serviceProviders: 38
  };

  // Simple stat card component
  const StatCard = ({ 
    title, 
    value, 
    icon, 
    change, 
    changeDirection = 'up' 
  }: StatCardProps) => {
    return (
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="p-2 rounded-md bg-gray-50">{icon}</div>
        </div>
        
        <div className="flex items-baseline mb-1">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
        </div>
        
        {change && (
          <div className="flex items-center mt-1">
            {changeDirection === 'up' ? (
              <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${changeDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change}%
            </span>
          </div>
        )}
      </div>
    );
  };

  // Simple tab system
  const TabButton = ({ id, label, active, onClick }: TabButtonProps) => {
    return (
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium ${
          active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
        }`}
        onClick={() => onClick(id)}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          <BarChart3 className="inline-block mr-2 h-6 w-6 text-blue-500" />
          Analytics Dashboard
        </h1>

        <div className="flex items-center space-x-2">
          <select 
            className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            defaultValue="last30days"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 days</option>
            <option value="last30days">Last 30 days</option>
            <option value="thisMonth">This month</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Grants" 
          value={stats.totalGrants} 
          icon={<Award className="h-5 w-5 text-blue-500" />}
          change="8.2"
          changeDirection="up"
        />
        <StatCard 
          title="Active Programs" 
          value={stats.activePrograms} 
          icon={<Briefcase className="h-5 w-5 text-green-500" />}
          change="4.1"
          changeDirection="up"
        />
        <StatCard 
          title="Disbursed Amount" 
          value={`₹${(stats.disbursedAmount / 100000).toFixed(1)}L`} 
          icon={<DollarSign className="h-5 w-5 text-amber-500" />}
          change="12.5"
          changeDirection="up"
        />
        <StatCard 
          title="Service Providers" 
          value={stats.serviceProviders} 
          icon={<Users className="h-5 w-5 text-purple-500" />}
          change="2.1"
          changeDirection="down"
        />
      </div>

      {/* Simple Tabs */}
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
      </div>

      {/* Tab Content */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-lg font-medium mb-4">Overview Dashboard</h2>
            <p className="text-gray-600">
              This is the overview dashboard showing the key metrics for your organization.
              More detailed visualizations will be available soon.
            </p>
          </div>
        )}

        {activeTab === 'grants' && (
          <div>
            <h2 className="text-lg font-medium mb-4">Grants Analysis</h2>
            <p className="text-gray-600">
              Detailed grant analysis and distribution data will be available soon.
              This will include charts for grant status, disbursements, and regional distribution.
            </p>
          </div>
        )}

        {activeTab === 'programs' && (
          <div>
            <h2 className="text-lg font-medium mb-4">Programs Performance</h2>
            <p className="text-gray-600">
              Program performance metrics and success rates will be available soon.
              This will include comparisons between different programs and their impact.
            </p>
          </div>
        )}
      </div>

      {/* Recent Activities */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Activities</h2>
        <div className="divide-y divide-gray-200">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="py-4 flex">
              <div className="mr-4">
                <div className="p-2 rounded-full bg-blue-100">
                  <Award className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {i % 2 === 0 ? 'Grant disbursed' : 'New program created'}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  by Administrator • {i} day{i !== 1 ? 's' : ''} ago
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
