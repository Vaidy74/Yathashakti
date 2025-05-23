"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { ReportBuilder } from "@/components/reports";

type ReportCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: {
    bg: string;
    border: string;
    text: string;
    button: string;
  };
};

const ReportCard: React.FC<ReportCardProps> = ({
  title,
  description,
  icon,
  color,
}) => {
  return (
    <div className={`p-4 ${color.bg} rounded-md border ${color.border}`}>
      <div className="flex items-center mb-2">
        {icon}
        <h3 className={`font-medium ${color.text} ml-2`}>{title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <button
        className={`w-full ${color.button} text-white px-4 py-2 rounded-md opacity-50 cursor-not-allowed`}
        disabled
      >
        Coming Soon
      </button>
    </div>
  );
};

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          Reports
        </h1>
        {/* Full-featured Report Builder UI */}
        <ReportBuilder />
      </div>
    </DashboardLayout>
  );
}
