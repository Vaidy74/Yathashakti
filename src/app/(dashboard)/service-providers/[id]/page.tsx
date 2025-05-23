"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "../../../components/DashboardLayout";
import { ServiceProviderWithRelations } from "@/types/service-provider";
import { 
  ArrowLeft, 
  Building, 
  Calendar, 
  Edit2, 
  Globe, 
  Loader2, 
  Mail, 
  MapPin, 
  Phone, 
  Trash2, 
  User,
  DollarSign,
  FileText,
  ListChecks,
  Briefcase,
  Users,
  Tag,
  Activity,
  BarChart3,
  FileCheck,
  TrendingUp,
  PieChart,
  Files
} from "lucide-react";
import ServiceProviderPerformance from "@/components/ServiceProviderPerformance";
import ServiceProviderDocuments from "@/components/ServiceProviderDocuments";

export default function ServiceProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };

  const [serviceProvider, setServiceProvider] = useState<ServiceProviderWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'performance' | 'documents'>('details');

  // Fetch the service provider details
  useEffect(() => {
    const fetchServiceProvider = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/service-providers/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Service provider not found");
          }
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setServiceProvider(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
        console.error("Failed to fetch service provider:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceProvider();
  }, [id]);

  // Handle delete service provider
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this service provider? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/service-providers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      router.push("/service-providers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete service provider");
      setIsDeleting(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Back button and actions */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/service-providers"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Service Providers
          </Link>
          {!isLoading && !error && serviceProvider && (
            <div className="flex space-x-3">
              <Link
                href={`/service-providers/${id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading service provider details...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading service provider</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button 
                  onClick={() => router.refresh()}
                  className="mt-2 text-sm text-red-700 underline hover:text-red-900"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        {!isLoading && !error && serviceProvider && (
          <div className="flex space-x-1 mb-6 border-b">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <span className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Details
              </span>
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'performance' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <span className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Performance Metrics
              </span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'documents' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <span className="flex items-center">
                <Files className="h-4 w-4 mr-2" />
                Documents
              </span>
            </button>
          </div>
        )}
        
        {/* Service Provider Details Tab */}
        {!isLoading && !error && serviceProvider && activeTab === 'details' && (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            {/* Header / Overview */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                    {serviceProvider.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="ml-6">
                  <h1 className="text-2xl font-bold text-gray-900">{serviceProvider.name}</h1>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <Building className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <span>{serviceProvider.category}</span>
                    <span className="mx-2">•</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {serviceProvider.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Metrics Summary */}
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
                Relationship Summary
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Programs */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                        <Briefcase className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Associated Programs</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {serviceProvider.programs?.length || 0}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Grants */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Associated Grants</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {serviceProvider.grants?.length || 0}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Grant Amount */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                        <Activity className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Grant Amount</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              ₹{serviceProvider.grants ? 
                                serviceProvider.grants.reduce((sum, grant) => sum + grant.amount, 0).toLocaleString() : 
                                '0'}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services Offered */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                        <FileCheck className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Services Offered</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {serviceProvider.services?.length || 0}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {serviceProvider.contactPerson && (
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Contact Person</p>
                      <p className="mt-1 text-sm text-gray-900">{serviceProvider.contactPerson}</p>
                    </div>
                  </div>
                )}
                
                {serviceProvider.contactNumber && (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Contact Number</p>
                      <p className="mt-1 text-sm text-gray-900">{serviceProvider.contactNumber}</p>
                    </div>
                  </div>
                )}
                
                {serviceProvider.email && (
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="mt-1 text-sm text-gray-900">{serviceProvider.email}</p>
                    </div>
                  </div>
                )}
                
                {serviceProvider.location && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="mt-1 text-sm text-gray-900">{serviceProvider.location}</p>
                    </div>
                  </div>
                )}
                
                {serviceProvider.website && (
                  <div className="flex items-start">
                    <Globe className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Website</p>
                      <a 
                        href={serviceProvider.website.startsWith('http') ? serviceProvider.website : `https://${serviceProvider.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-1 text-sm text-blue-600 hover:underline"
                      >
                        {serviceProvider.website}
                      </a>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Registered On</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {serviceProvider.registeredOn ? formatDate(serviceProvider.registeredOn) : 'Not specified'}
                    </p>
                  </div>
                </div>

                {serviceProvider.ratePerDay !== null && (
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Rate Per Day</p>
                      <p className="mt-1 text-sm text-gray-900">
                        ₹{serviceProvider.ratePerDay.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {serviceProvider.description && (
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Description</h2>
                </div>
                <div className="prose max-w-none">
                  <p className="text-sm text-gray-700">{serviceProvider.description}</p>
                </div>
              </div>
            )}

            {/* Services */}
            {serviceProvider.services && serviceProvider.services.length > 0 && (
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center mb-4">
                  <ListChecks className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Services Offered</h2>
                </div>
                <ul className="list-disc list-inside text-sm text-gray-700 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {serviceProvider.services.map((service: string, index: number) => (
                    <li key={index} className="pl-1">{service}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Associated Programs */}
            {serviceProvider.programs && serviceProvider.programs.length > 0 && (
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center mb-4">
                  <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Associated Programs</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceProvider.programs.map((program: { id: string; name: string }) => (
                    <div key={program.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-md font-medium text-gray-900 mb-1 truncate">{program.name}</h3>
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mr-2">
                              <Briefcase className="h-3 w-3 mr-1" /> Program
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Link
                          href={`/programs/${program.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 inline-flex items-center"
                        >
                          View Program <ArrowLeft className="h-3 w-3 ml-1 transform rotate-180" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Associated Grants */}
            {serviceProvider.grants && serviceProvider.grants.length > 0 && (
              <div className="px-6 py-5">
                <div className="flex items-center mb-4">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Associated Grants</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grant ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grantee
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {serviceProvider.grants.map((grant: { id: string; grantIdentifier: string; amount: number; status?: string; grantee?: { id: string; name: string } }) => (
                        <tr key={grant.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {grant.grantIdentifier}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {grant.grantee ? (
                              <Link href={`/grantees/${grant.grantee.id}`} className="text-blue-600 hover:text-blue-900">
                                {grant.grantee.name}
                              </Link>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{grant.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${grant.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : grant.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                              {grant.status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Link
                              href={`/grants/${grant.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No relationships message */}
            {(!serviceProvider.grants || serviceProvider.grants.length === 0) && 
             (!serviceProvider.programs || serviceProvider.programs.length === 0) && (
              <div className="px-6 py-5 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-500 italic">
                    No relationships (programs or grants) are currently associated with this service provider.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Performance Metrics Tab */}
        {!isLoading && !error && serviceProvider && activeTab === 'performance' && (
          <ServiceProviderPerformance serviceProviderId={id} />
        )}
        
        {/* Documents Tab */}
        {!isLoading && !error && serviceProvider && activeTab === 'documents' && (
          <ServiceProviderDocuments serviceProviderId={id} />
        )}
      </div>
    </DashboardLayout>
  );
}
