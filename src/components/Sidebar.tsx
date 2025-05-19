"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Home, Users, PieChart, FileText, DollarSign, 
  Briefcase, Award, Calendar, Settings, 
  BarChart2, Heart, User, Bot, ChevronDown, ChevronRight,
  Wrench, Gauge, FolderClosed, MessageCircle
} from 'lucide-react';

// Add Home Page at the very top
const homeItem = { name: 'Home Page', href: '/', icon: Home };

// Organize navigation items by category
const navCategories = [
  { 
    name: 'Setup', 
    icon: Settings,
    items: [
      { name: 'Donors', href: '/donors', icon: Heart },
      { name: 'Programs', href: '/programs', icon: Briefcase },
      { name: 'Service Providers', href: '/service-providers', icon: Award },
    ] 
  },
  { 
    name: 'Manage', 
    icon: FolderClosed,
    items: [
      { name: 'Grantees', href: '/grantees', icon: Users },
      { name: 'Grants', href: '/grants', icon: DollarSign },
      { name: 'Tasks', href: '/tasks', icon: Calendar },
      // Communication Center will be added later
      // { name: 'Communication', href: '/communication', icon: MessageCircle },
    ] 
  },
  { 
    name: 'Monitor', 
    icon: Gauge,
    items: [
      { name: 'Reports', href: '/reports', icon: BarChart2 },
      { name: 'Ledger', href: '/ledger', icon: FileText },
    ] 
  },
  { 
    name: 'Tools', 
    icon: Wrench,
    items: [
      { name: 'AI Features', href: '/ai', icon: Bot },
      { name: 'Settings', href: '/settings', icon: Settings },
    ] 
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    Setup: true,   // Start with Setup category open
    Manage: true,  // Start with Manage category open
    Monitor: true, // Start with Monitor category open
    Tools: false,
  });
  
  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  return (
    <aside className="bg-white border-r border-gray-200 w-64 min-h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-blue-600">Yathashakti</h1>
        <p className="text-sm text-gray-500">Revolving Grants Platform</p>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <nav className="space-y-1 px-2">
          {/* Home Page at the top */}
          <Link
            href={homeItem.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm rounded-md transition-colors mb-3 border-b pb-3",
              pathname === homeItem.href
                ? "bg-blue-50 text-blue-700 font-medium" 
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <homeItem.icon className={cn("mr-3 h-5 w-5", pathname === homeItem.href ? "text-blue-700" : "text-gray-400")} />
            {homeItem.name}
          </Link>
          
          {navCategories.map((category) => {
            const CategoryIcon = category.icon;
            const isOpen = openCategories[category.name];
            const ChevronIcon = isOpen ? ChevronDown : ChevronRight;
            
            return (
              <div key={category.name} className="mb-2">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <div className="flex items-center">
                    <CategoryIcon className="mr-3 h-5 w-5 text-gray-500" />
                    {category.name}
                  </div>
                  <ChevronIcon className="h-4 w-4 text-gray-500" />
                </button>
                
                {/* Category items */}
                {isOpen && (
                  <div className="mt-1 ml-4 pl-3 border-l border-gray-200 space-y-1">
                    {category.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                            isActive 
                              ? "bg-blue-50 text-blue-700 font-medium" 
                              : "text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-700" : "text-gray-400")} />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
