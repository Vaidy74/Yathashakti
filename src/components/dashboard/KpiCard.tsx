import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, ArrowRight, Activity, Users, AlertTriangle, Heart } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  trend?: string;
  icon: string;
  color: string;
  link?: string;
}

export default function KpiCard({
  title,
  value,
  description,
  trend,
  icon,
  color,
  link = '/'
}: KpiCardProps) {
  // Map string icon names to components
  const iconMap: Record<string, React.ReactNode> = {
    'TrendingUp': <TrendingUp className="h-6 w-6" />,
    'Activity': <Activity className="h-6 w-6" />,
    'Users': <Users className="h-6 w-6" />,
    'AlertTriangle': <AlertTriangle className="h-6 w-6" />,
    'Heart': <Heart className="h-6 w-6" />
  };

  // Map color names to color classes
  const colorMap: Record<string, { bg: string, text: string, icon: string }> = {
    'blue': { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
    'green': { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-500' },
    'red': { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-500' },
    'purple': { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500' },
    'yellow': { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-500' }
  };

  const colorClasses = colorMap[color] || colorMap.blue;

  return (
    <Link href={link}>
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className={cn("p-2 rounded-md", colorClasses.bg)}>
            <div className={colorClasses.icon}>
              {iconMap[icon] || <Activity className="h-6 w-6" />}
            </div>
          </div>
          
          {trend && (
            <div className="flex items-center">
              {trend.includes('+') ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : trend.includes('-') ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <span className="h-4 w-4 block bg-gray-300 rounded-full"></span>
              )}
              <span className={cn(
                "text-xs ml-1",
                trend.includes('+') ? "text-green-500" : 
                trend.includes('-') ? "text-red-500" : 
                "text-gray-500"
              )}>
                {trend}
              </span>
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-bold mb-1">{value}</h3>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <p className="text-sm text-blue-500 flex items-center">
          {description}
          <ArrowRight className="h-3 w-3 ml-1" />
        </p>
      </div>
    </Link>
  );
}
