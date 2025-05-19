"use client";

import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  ChartData
} from 'chart.js';

// Register the components
ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  data: ChartData<'doughnut'>;
}

export default function DonutChart({ data }: DonutChartProps) {
  // Add client-side rendering check
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.chart._metasets[context.datasetIndex].total;
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
  };

  return (
    <div className="h-full w-full flex items-center justify-center">
      {isClient ? (
        <Doughnut data={data} options={options} />
      ) : (
        <div className="text-gray-500">Loading chart...</div>
      )}
    </div>
  );
}
