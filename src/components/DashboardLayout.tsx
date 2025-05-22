"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Search } from 'lucide-react';
import AssistantBot from './AssistantBot';
import { usePathname } from 'next/navigation';
import NotificationCenter from './notifications/NotificationCenter';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [appState, setAppState] = useState({
    isEmpty: false,
    totalGrants: 0,
    totalPrograms: 0,
    serviceProviders: 0
  });
  const pathname = usePathname();
  
  // Get the current page section from pathname
  const getCurrentPage = () => {
    if (pathname === '/') return 'dashboard';
    if (pathname.includes('/dashboard')) return 'analytics';
    if (pathname.includes('/grants')) return 'grants';
    if (pathname.includes('/programs')) return 'programs';
    if (pathname.includes('/service-providers')) return 'service-providers';
    return 'dashboard';
  };
  
  // Fetch app state data for the assistant
  useEffect(() => {
    const fetchAppState = async () => {
      try {
        const response = await fetch('/api/dashboard?dateRange=last30days');
        if (response.ok) {
          const data = await response.json();
          setAppState({
            isEmpty: data.isEmpty || false,
            totalGrants: data.stats?.totalGrants || 0,
            totalPrograms: data.stats?.activePrograms || 0,
            serviceProviders: data.stats?.serviceProviders || 0
          });
        }
      } catch (error) {
        console.error('Error fetching app state:', error);
      }
    };
    
    fetchAppState();
  }, [pathname]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex-1 flex">
              <div className="relative max-w-md w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search..."
                  type="search"
                />
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <NotificationCenter />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        
        {/* AI Assistant Bot - Available across the platform */}
        <AssistantBot 
          appState={{
            isEmpty: appState.isEmpty,
            currentPage: getCurrentPage(),
            totalGrants: appState.totalGrants,
            totalPrograms: appState.totalPrograms
          }}
        />
      </div>
    </div>
  );
}
