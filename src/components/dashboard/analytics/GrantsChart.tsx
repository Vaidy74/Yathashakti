import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import Chart from 'chart.js/auto';

interface GrantsChartProps {
  isLoading?: boolean;
}

export default function GrantsChart({ isLoading = false }: GrantsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  // Mock data for grants by status
  const mockData = {
    labels: ['Active', 'Completed', 'Pending', 'Canceled', 'Delayed'],
    datasets: [
      {
        label: 'Number of Grants',
        data: [65, 43, 12, 8, 15],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Alternative mock data for when switching views
  const mockDisbursementData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Disbursements (₹ Lakhs)',
        data: [18, 25, 32, 48, 35, 42, 55, 62, 48, 53, 41, 50],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.3, // Smoother line
        fill: true
      }
    ]
  };

  const [dataType, setDataType] = useState<'status' | 'disbursement'>('status');
  const [chartType, setChartType] = useState<'pie' | 'doughnut' | 'bar' | 'line'>('doughnut');

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
        type: dataType === 'status' ? 
              (chartType === 'bar' ? 'bar' : chartType) : 
              'line',
        data: dataType === 'status' ? mockData : mockDisbursementData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  
                  if (dataType === 'disbursement') {
                    return label + '₹' + context.parsed.y + ' Lakhs';
                  } else {
                    return label + context.parsed + ' Grants';
                  }
                }
              }
            }
          },
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [isLoading, dataType, chartType]);

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
            className={`px-3 py-1 text-sm rounded ${dataType === 'status' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setDataType('status')}
          >
            By Status
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded ${dataType === 'disbursement' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setDataType('disbursement')}
          >
            By Disbursements
          </button>
        </div>
        
        {dataType === 'status' && (
          <div className="flex space-x-2">
            <button 
              className={`px-2 py-1 text-xs rounded ${chartType === 'doughnut' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setChartType('doughnut')}
            >
              Doughnut
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded ${chartType === 'pie' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setChartType('pie')}
            >
              Pie
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded ${chartType === 'bar' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setChartType('bar')}
            >
              Bar
            </button>
          </div>
        )}
      </div>
      
      <div className="relative h-full">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
