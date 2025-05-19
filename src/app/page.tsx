"use client";

import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import KpiCard from '@/components/dashboard/KpiCard';
import DonutChart from '@/components/dashboard/DonutChart';
import LineChart from '@/components/dashboard/LineChart';

export default function Dashboard() {
  // Monthly grant disbursement mock data
  const monthlyDisbursementData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Amount Disbursed (₹)',
        data: [0, 0, 50000, 30000, 0, 0, 15000, 0, 10000, 0, 0, 0],
        fill: false,
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
      }
    ]
  };
  
  // Calculate the total disbursement amount from monthly data
  const totalDisbursed = monthlyDisbursementData.datasets[0].data.reduce((sum, amount) => sum + amount, 0);
  const formattedTotal = totalDisbursed >= 100000 
    ? `₹${(totalDisbursed / 100000).toFixed(1)}L` 
    : `₹${totalDisbursed.toLocaleString('en-IN')}`;

  // Mock data for the dashboard
  const kpiData = [
    {
      title: 'Grants Under Management',
      value: formattedTotal, // Use the calculated total
      description: 'Click to view details',
      trend: '+5%',
      icon: 'TrendingUp',
      color: 'blue'
    },
    {
      title: 'Live Programs',
      value: '2',
      description: 'Click to view details',
      trend: 'stable',
      icon: 'Activity', 
      color: 'green'
    },
    {
      title: 'Total Number of Grantees',
      value: '4',
      description: 'Click to view details', 
      trend: '+2',
      icon: 'Users',
      color: 'purple'
    },
    {
      title: 'Overdue Grants',
      value: '0',
      description: 'Click to view details',
      trend: '-1',
      icon: 'AlertTriangle',
      color: 'red'
    }
  ];

  // Program status mock data
  const programStatusData = {
    labels: ['Planning', 'Live', 'On Hold', 'Closed'],
    datasets: [
      {
        data: [1, 2, 0, 1],
        backgroundColor: [
          'rgba(96, 165, 250, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 1,
      },
    ]
  };

  // Program category mock data
  const programCategoryData = {
    labels: ['Skilling', 'Agriculture', 'Entrepreneurship', 'Education'],
    datasets: [
      {
        data: [1, 1, 1, 1],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderWidth: 1,
      },
    ]
  };

  // Monthly grant disbursement data is defined above

  return (
    <DashboardLayout>
      <div className="p-4">
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Program Overview by Status</h2>
            <div className="h-64">
              <DonutChart data={programStatusData} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Program Overview by Category</h2>
            <div className="h-64">
              <DonutChart data={programCategoryData} />
            </div>
          </div>
        </div>

        {/* Monthly Grant Disbursement */}
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold mb-4">Monthly Grant Disbursement (Last 12 Months)</h2>
          <div className="h-64">
            <LineChart data={monthlyDisbursementData} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
