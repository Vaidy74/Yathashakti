import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import Chart from 'chart.js/auto';

interface ProgramsChartProps {
  isLoading?: boolean;
}

export default function ProgramsChart({ isLoading = false }: ProgramsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const [metric, setMetric] = useState<'success' | 'budget' | 'timeline'>('success');

  // Mock data for program performance metrics
  const programNames = [
    'Rural Entrepreneurship', 
    'Women Entrepreneurship', 
    'Youth Skills Development', 
    'Green Initiatives',
    'Health & Wellness',
    'Education Access'
  ];

  const successRateData = {
    labels: programNames,
    datasets: [
      {
        label: 'Success Rate (%)',
        data: [78, 85, 62, 91, 74, 68],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        maxBarThickness: 40
      }
    ]
  };

  const budgetUtilizationData = {
    labels: programNames,
    datasets: [
      {
        label: 'Budget Utilized (%)',
        data: [92, 78, 85, 64, 87, 73],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        maxBarThickness: 40
      }
    ]
  };

  const timelineAdherenceData = {
    labels: programNames,
    datasets: [
      {
        label: 'Timeline Adherence (%)',
        data: [65, 82, 75, 88, 70, 80],
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
        maxBarThickness: 40
      }
    ]
  };

  // Get the appropriate data based on selected metric
  const getChartData = () => {
    switch (metric) {
      case 'success':
        return successRateData;
      case 'budget':
        return budgetUtilizationData;
      case 'timeline':
        return timelineAdherenceData;
      default:
        return successRateData;
    }
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
        type: 'bar',
        data: getChartData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',  // Horizontal bar chart
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  return label + context.parsed.x + '%';
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              max: 100,
              grid: {
                display: true,
                drawBorder: true,
              },
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            },
            y: {
              grid: {
                display: false,
                drawBorder: true,
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
  }, [isLoading, metric]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <button 
          className={`px-3 py-1 text-sm rounded ${metric === 'success' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          onClick={() => setMetric('success')}
        >
          Success Rate
        </button>
        <button 
          className={`px-3 py-1 text-sm rounded ${metric === 'budget' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          onClick={() => setMetric('budget')}
        >
          Budget Utilization
        </button>
        <button 
          className={`px-3 py-1 text-sm rounded ${metric === 'timeline' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          onClick={() => setMetric('timeline')}
        >
          Timeline Adherence
        </button>
      </div>
      
      <div className="relative h-full">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
