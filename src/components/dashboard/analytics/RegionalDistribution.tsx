import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import Chart from 'chart.js/auto';

interface RegionalDistributionProps {
  isLoading?: boolean;
}

export default function RegionalDistribution({ isLoading = false }: RegionalDistributionProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const [viewType, setViewType] = useState<'count' | 'amount'>('count');

  // Mock data for regional distribution
  const regions = [
    'North India', 
    'South India', 
    'East India', 
    'West India', 
    'Central India', 
    'Northeast India'
  ];

  const grantCountData = {
    labels: regions,
    datasets: [
      {
        label: 'Number of Grants',
        data: [32, 45, 18, 29, 14, 12],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const grantAmountData = {
    labels: regions,
    datasets: [
      {
        label: 'Total Grant Amount (₹ Lakhs)',
        data: [142, 215, 76, 168, 54, 45],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Get the appropriate data based on selected view type
  const getChartData = () => {
    return viewType === 'count' ? grantCountData : grantAmountData;
  };

  useEffect(() => {
    if (isLoading || !chartRef.current) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'polarArea',
        data: getChartData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.label || '';
                  if (label) {
                    label += ': ';
                  }
                  
                  if (viewType === 'amount') {
                    return label + '₹' + context.raw + ' Lakhs';
                  } else {
                    return label + context.raw + ' Grants';
                  }
                }
              }
            }
          },
          scales: {
            r: {
              ticks: {
                display: false
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [isLoading, viewType]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 text-sm rounded ${viewType === 'count' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setViewType('count')}
          >
            Grant Count
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded ${viewType === 'amount' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setViewType('amount')}
          >
            Grant Amount
          </button>
        </div>
      </div>
      
      <div className="relative h-full">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
