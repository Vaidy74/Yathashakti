"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

// Register all Chart.js components
Chart.register(...registerables);

interface GranteeMetricsCardProps {
  data: {
    sectors: string[];
    granteeCount: number[];
    colors: string[];
  };
  title: string;
  totalGrantees: number;
}

export default function GranteeMetricsCard({
  data,
  title,
  totalGrantees
}: GranteeMetricsCardProps) {
  const chartRef = useRef(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      // Get the context
      const ctx = chartRef.current.getContext('2d');
      
      // Create chart
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.sectors,
          datasets: [
            {
              data: data.granteeCount,
              backgroundColor: data.colors,
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 15,
                padding: 15
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw as number;
                  const percentage = Math.round((value / totalGrantees) * 100);
                  return `${label}: ${value} grantees (${percentage}%)`;
                }
              }
            }
          },
          cutout: '70%'
        }
      });
    }
    
    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, totalGrantees]);
  
  // Calculate top sector
  const getTopSector = () => {
    let maxIndex = 0;
    let maxValue = 0;
    
    data.granteeCount.forEach((count, index) => {
      if (count > maxValue) {
        maxValue = count;
        maxIndex = index;
      }
    });
    
    return {
      name: data.sectors[maxIndex],
      count: maxValue
    };
  };
  
  const topSector = getTopSector();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 mb-4 lg:mb-0">
          <div className="h-56 relative">
            <canvas ref={chartRef}></canvas>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-bold text-gray-800">{totalGrantees}</span>
              <span className="text-sm text-gray-500">Total Grantees</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 lg:ml-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm font-medium text-gray-500">Top Sector</div>
            <div className="text-xl font-semibold mt-1">{topSector.name}</div>
            <div className="text-sm text-gray-700 mt-1">
              {topSector.count} grantees ({Math.round((topSector.count / totalGrantees) * 100)}%)
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-500">Female Grantees</span>
                <span className="text-gray-900">42%</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-pink-500 h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-500">Youth Grantees</span>
                <span className="text-gray-900">35%</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-500">First-time Entrepreneurs</span>
                <span className="text-gray-900">68%</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
