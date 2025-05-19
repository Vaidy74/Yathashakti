"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Users, Search, Filter, UserPlus, ArrowUpDown, 
  ChevronRight, Phone, MapPin, Building
} from "lucide-react";

export default function ServiceProvidersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  
  // Mock service providers data
  const serviceProviders = [
    {
      id: "sp1",
      name: "TechMind Solutions",
      category: "Technical Training",
      location: "Bangalore, Karnataka",
      contactPerson: "Rahul Sharma",
      contactNumber: "+91 98765 43210",
      email: "contact@techmind.com",
      activeEngagements: 3
    },
    {
      id: "sp2",
      name: "AgriGrow Consultancy",
      category: "Agricultural Advisory",
      location: "Jaipur, Rajasthan",
      contactPerson: "Priya Verma",
      contactNumber: "+91 87654 32109",
      email: "info@agrigrow.com",
      activeEngagements: 5
    },
    {
      id: "sp3",
      name: "FinSkill Academy",
      category: "Financial Literacy",
      location: "Mumbai, Maharashtra",
      contactPerson: "Aditya Patel",
      contactNumber: "+91 76543 21098",
      email: "academy@finskill.com",
      activeEngagements: 2
    },
    {
      id: "sp4",
      name: "WomenTech Foundation",
      category: "Gender-focused Training",
      location: "Delhi, NCR",
      contactPerson: "Meera Ahuja",
      contactNumber: "+91 65432 10987",
      email: "connect@womentech.org",
      activeEngagements: 4
    },
    {
      id: "sp5",
      name: "EcoSmart Solutions",
      category: "Environmental Consulting",
      location: "Chennai, Tamil Nadu",
      contactPerson: "Vikram Subramanian",
      contactNumber: "+91 54321 09876",
      email: "hello@ecosmart.in",
      activeEngagements: 1
    }
  ];

  // Get unique categories for filter
  const categories = [...new Set(serviceProviders.map(sp => sp.category))];
  
  // Filter service providers based on search and filter
  const filteredProviders = serviceProviders.filter(provider => {
    const matchesSearch = 
      searchTerm === "" ||
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.location.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = 
      filterCategory === "" ||
      provider.category === filterCategory;
      
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-500" />
            Service Providers
          </h1>
          <Link
            href="/service-providers/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Service Provider
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative rounded-md shadow-sm col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search service providers by name, contact, or location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-4">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort
            </button>
          </div>
        </div>

        {/* Service Providers List */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <ul role="list" className="divide-y divide-gray-200">
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider) => (
                <li key={provider.id}>
                  <Link
                    href={`/service-providers/${provider.id}`}
                    className="block hover:bg-gray-50 transition duration-150"
                  >
                    <div className="px-6 py-5 flex items-center">
                      <div className="min-w-0 flex-1 flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-lg">
                            {provider.name.substring(0, 2).toUpperCase()}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                          <div>
                            <p className="text-sm font-medium text-blue-600 truncate">{provider.name}</p>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <Building className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <span className="truncate">{provider.category}</span>
                            </div>
                          </div>
                          <div className="hidden md:block">
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <span className="truncate">{provider.location}</span>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <span className="truncate">{provider.contactPerson} • {provider.contactNumber}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-5 flex flex-col items-end">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {provider.activeEngagements} Active
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-6 py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No service providers found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <div className="mt-6">
                  <Link 
                    href="/service-providers/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Service Provider
                  </Link>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
