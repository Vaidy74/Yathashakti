"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ChatAssistant from "@/components/ai/ChatAssistant";
import GranteeAssessment from "@/components/ai/GranteeAssessment";
import DocumentAnalysis from "@/components/ai/DocumentAnalysis";
import { Bot, ArrowRight, Sparkles, Users, PieChart, Clock, Brain, MessageSquare, FileText } from "lucide-react";

export default function AIFeaturesPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Bot className="h-6 w-6 mr-2 text-blue-500" />
            AI-Powered Features
          </h1>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm mb-8 p-6">
          <div className="flex items-center">
            <Sparkles className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Enhancing Grant Management with AI
              </h2>
              <p className="mt-1 text-gray-600">
                Our AI-powered tools help you make data-driven decisions, automate repetitive tasks,
                and gain valuable insights from your grantee and program data.
              </p>
            </div>
          </div>
        </div>

        {/* AI Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="bg-blue-100 text-blue-700 rounded-full p-3 inline-flex">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Grantee Assessment
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Use AI to evaluate grantee applications, predict repayment likelihood,
                and receive optimal funding recommendations.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="bg-purple-100 text-purple-700 rounded-full p-3 inline-flex">
                <PieChart className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Intelligent Reporting
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Generate AI-enhanced reports with automatic insights, anomaly detection,
                and data visualization recommendations.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="bg-green-100 text-green-700 rounded-full p-3 inline-flex">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Forecasting & Prediction
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Leverage AI models to forecast repayment trends, identify at-risk grants,
                and optimize your grant portfolio.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Grantee Assessment Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-blue-500" />
              Grantee Assessment Demo
            </h2>
            <GranteeAssessment />
          </div>

          {/* Document Analysis Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              Document Analysis Demo
            </h2>
            <DocumentAnalysis />
          </div>

          {/* Chat Assistant Info Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                AI Assistant
              </h2>
              <p className="text-gray-600">
                Our AI assistant is available throughout the platform to help you with tasks, answer questions,
                and provide insights. Click the chat icon in the bottom right corner to start a conversation.
              </p>
              
              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800">Try asking the assistant:</h3>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-center text-sm text-blue-700">
                    <ArrowRight className="h-4 w-4 mr-2 flex-shrink-0" />
                    "Generate a report on repayment rates across programs"
                  </li>
                  <li className="flex items-center text-sm text-blue-700">
                    <ArrowRight className="h-4 w-4 mr-2 flex-shrink-0" />
                    "Recommend a suitable grant amount for a new grantee"
                  </li>
                  <li className="flex items-center text-sm text-blue-700">
                    <ArrowRight className="h-4 w-4 mr-2 flex-shrink-0" />
                    "Forecast repayment trends for the next quarter"
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Assistant is available globally */}
      <ChatAssistant />
    </DashboardLayout>
  );
}
