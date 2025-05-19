"use client";

import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import { ArrowUpRight, Download } from "lucide-react";

// Register all Chart.js components
Chart.register(...registerables);

interface GrantMetricsChartProps {
  data: {
    labels: string[];
    disbursed: number[];
    repaid: number[];
  };
  title: string;
  periodLabel: string;
  currency?: string;
}

export default function GrantMetricsChart({ 
  data, 
  title, 
  periodLabel,
  currency = "INR" 
}: GrantMetricsChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true once component is mounted
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate stats
  const totalDisbursed = data.disbursed.reduce((sum, val) => sum + val, 0);
  const totalRepaid = data.repaid.reduce((sum, val) => sum + val, 0);
  const repaymentRate = totalDisbursed > 0 ? (totalRepaid / totalDisbursed) * 100 : 0;

  // Export chart as image
  const exportChart = () => {
    if (chartInstance.current) {
      const link = document.createElement('a');
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-chart.png`;
      link.href = chartInstance.current.toBase64Image();
      link.click();
    }
  };

  useEffect(() => {
    // Only run on client-side and when DOM is fully ready
    if (isClient && chartRef.current) {
      // Delay chart creation slightly to ensure DOM is ready
      const timer = setTimeout(() => {
        // Destroy existing chart if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      
        // Get the context
        const ctx = chartRef.current.getContext('2d');
        
        // Create chart
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.labels,
            datasets: [
              {
                label: 'Disbursed',
                data: data.disbursed,
                backgroundColor: 'rgba(59, 130, 246, 0.5)', // Blue
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
              },
              {
                label: 'Repaid',
                data: data.repaid,
                backgroundColor: 'rgba(34, 197, 94, 0.5)', // Green
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1
              }
            ]
          },
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
                    const label = context.dataset.label || '';
                    if (label) {
                      const value = context.raw as number;
                      return `${label}: ${formatCurrency(value)}`;
                    }
                    return '';
                  }
                }
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: periodLabel
                }
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: `Amount (${currency})`
                },
                ticks: {
                  // Include currency symbol in the ticks
                  callback: function(value) {
                    return formatCurrency(value as number);
                  }
                }
              }
            }
          }
        });
      }, 100); // Small delay to ensure DOM is ready
      
      // Cleanup
      return () => {
        clearTimeout(timer);
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      };
    }
  }, [data, currency, periodLabel, isClient]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <button 
          onClick={exportChart}
          className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download className="h-3 w-3 mr-1" />
          Export
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-xs text-blue-500 font-medium">Total Disbursed</p>
          <p className="text-lg font-bold text-blue-700">{formatCurrency(totalDisbursed)}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-md">
          <p className="text-xs text-green-500 font-medium">Total Repaid</p>
          <p className="text-lg font-bold text-green-700">{formatCurrency(totalRepaid)}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-md">
          <p className="text-xs text-purple-500 font-medium">Repayment Rate</p>
          <p className="text-lg font-bold text-purple-700 flex items-center">
            {repaymentRate.toFixed(1)}% 
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </p>
        </div>
      </div>
      
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
