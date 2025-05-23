"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import KpiCard from '@/components/dashboard/KpiCard';
import DonutChart from '@/components/dashboard/DonutChart';
import LineChart from '@/components/dashboard/LineChart';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEmpty, setIsEmpty] = useState<boolean>(true);
  const [stats, setStats] = useState({
    totalGrants: 0,
    activeGrants: 0,
    activePrograms: 0,
    disbursedAmount: 0,
    serviceProviders: 0
  });
  
  // Fetch dashboard data from the database
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/dashboard?dateRange=last30days');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setStats(data.stats);
        setIsEmpty(data.isEmpty || false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Format currency for display
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

  // KPI data from real database
  const kpiData = [
    {
      title: 'Grants Under Management',
      value: isEmpty ? '0' : formatCurrency(stats.disbursedAmount),
      description: 'View details',
      trend: isEmpty ? 'stable' : '+5%',
      icon: 'TrendingUp',
      color: 'blue'
    },
    {
      title: 'Live Programs',
      value: isEmpty ? '0' : stats.activePrograms.toString(),
      description: 'View details',
      trend: isEmpty ? 'stable' : 'stable',
      icon: 'Activity',
      color: 'green'
    },
    {
      title: 'Total Number of Grantees',
      value: isEmpty ? '0' : stats.totalGrants.toString(),
      description: 'View details',
      trend: isEmpty ? 'stable' : '+2',
      icon: 'Users',
      color: 'purple'
    },
    {
      title: 'Service Providers',
      value: isEmpty ? '0' : stats.serviceProviders.toString(),
      description: 'View details',
      trend: isEmpty ? 'stable' : '0',
      icon: 'AlertTriangle', // Changed from 'Briefcase' to match available icons
      color: 'red' // Changed to match colors in KpiCard
    }
  ];

  // Empty chart data for structure without mock values but with proper formatting
  const emptyChartData = {
    labels: ['No Data'],
    datasets: [{
      data: [1],
      backgroundColor: ['rgba(200, 200, 200, 0.3)'],
      borderWidth: 1
    }]
  };

  // Empty line chart data
  const emptyLineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Amount Disbursed (₹)',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      fill: false,
      borderColor: 'rgb(59, 130, 246)',
      tension: 0.4,
      pointBackgroundColor: 'rgb(59, 130, 246)',
    }]
  };

  return (
    <DashboardLayout>
      <div className="p-4" data-component-name="Dashboard">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <p className="text-sm text-gray-500 mb-8">View real-time program stats and track campaign effectiveness</p>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiData.map((kpi, index) => (
            <KpiCard
              key={index}
              title={kpi.title}
              value={kpi.value}
              description={kpi.description}
              trend={kpi.trend}
              icon={kpi.icon}
              color={kpi.color}
            />
          ))}
        </div>

        {/* Database empty notification moved to analytics dashboard */}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Program Overview by Status</h2>
            <div className="h-64">
              <DonutChart data={emptyChartData} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Program Overview by Category</h2>
            <div className="h-64">
              <DonutChart data={emptyChartData} />
            </div>
          </div>
        </div>

        {/* Monthly Grant Disbursement */}
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold mb-4">Monthly Grant Disbursement (Last 12 Months)</h2>
          <div className="h-64">
            <LineChart data={emptyLineData} />
          </div>
        </div>
        
        {/* Action cards removed for cleaner dashboard */}
      </div>
    </DashboardLayout>
  );
}
