import { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: number;
  changeLabel?: string;
  isLoading?: boolean;
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  change, 
  changeLabel = "%",
  isLoading = false
}: StatCardProps) {
  const isPositiveChange = (change || 0) >= 0;
  
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 rounded-md bg-gray-50">{icon}</div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center h-8 mb-1">
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="flex items-baseline mb-1">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
        </div>
      )}
      
      {change !== undefined && !isLoading && (
        <div className="flex items-center mt-1">
          {isPositiveChange ? (
            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
            {isPositiveChange ? '+' : ''}{Math.abs(change)}{changeLabel}
          </span>
        </div>
      )}
    </div>
  );
}
