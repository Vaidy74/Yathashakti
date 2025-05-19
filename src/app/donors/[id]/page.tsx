"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Heart, ChevronLeft, Edit, ExternalLink, Calendar, Mail, Phone, MapPin, FileText, PenTool } from "lucide-react";

// Mock donor data (in a real app, this would be fetched from an API)
const MOCK_DONORS = {
  "1": {
    id: "1",
    name: "Rajesh Mehta",
    type: "INDIVIDUAL",
    keyContact: "Self",
    keyContactRole: "",
    email: "rajesh.mehta@example.com",
    phone: "+91 9898989898",
    address: "123 Main Street, Mumbai, Maharashtra",
    totalContributions: 250000,
    onboardingDate: "2025-01-10",
    contacts: [],
    documents: [
      { id: "doc1", label: "ID Proof", type: "KYC", uploadedDate: "2025-01-10" }
    ],
    programs: [
      { id: "prog1", name: "Rural Entrepreneurship Initiative", contribution: 150000, date: "2025-01-15" },
      { id: "prog2", name: "Women Empowerment Program", contribution: 100000, date: "2025-02-20" }
    ]
  },
  "2": {
    id: "2",
    name: "Tata Foundation",
    type: "LEGAL_ENTITY",
    keyContact: "Ratan Naval Tata",
    keyContactRole: "Chairman",
    email: "contact@tatafoundation.org",
    phone: "+91 2222334455",
    address: "Bombay House, 24 Homi Mody Street, Mumbai",
    totalContributions: 5000000,
    onboardingDate: "2025-02-15",
    contacts: [
      { id: "contact1", name: "Noel Tata", role: "Trustee", email: "noel@tatafoundation.org", phone: "+91 9876543210" },
      { id: "contact2", name: "Ratan Tata Jr", role: "Program Director", email: "ratan.jr@tatafoundation.org", phone: "+91 9876543211" }
    ],
    documents: [
      { id: "doc2", label: "MOU", type: "Agreement", uploadedDate: "2025-02-15" },
      { id: "doc3", label: "Trust Registration", type: "Legal", uploadedDate: "2025-02-15" }
    ],
    programs: [
      { id: "prog1", name: "Rural Entrepreneurship Initiative", contribution: 3000000, date: "2025-02-20" },
      { id: "prog3", name: "Education for All", contribution: 2000000, date: "2025-03-15" }
    ]
  },
  "3": {
    id: "3",
    name: "Ambani Family Trust",
    type: "LEGAL_ENTITY",
    keyContact: "Mukesh Ambani",
    keyContactRole: "Trustee",
    email: "contact@ambani-trust.org",
    phone: "+91 9999888877",
    address: "Maker Chambers IV, 222 Nariman Point, Mumbai",
    totalContributions: 2500000,
    onboardingDate: "2025-03-01",
    contacts: [
      { id: "contact3", name: "Nita Ambani", role: "Trustee", email: "nita@ambani-trust.org", phone: "+91 9876543212" }
    ],
    documents: [
      { id: "doc4", label: "Trust Deed", type: "Legal", uploadedDate: "2025-03-01" }
    ],
    programs: [
      { id: "prog2", name: "Women Empowerment Program", contribution: 1500000, date: "2025-03-10" },
      { id: "prog4", name: "Digital Literacy Program", contribution: 1000000, date: "2025-04-01" }
    ]
  },
  "4": {
    id: "4",
    name: "Aditya Birla Group CSR",
    type: "LEGAL_ENTITY",
    keyContact: "Kumar Mangalam Birla",
    keyContactRole: "Chairman",
    email: "csr@adityabirla.com",
    phone: "+91 2233445566",
    address: "Aditya Birla Centre, S.K. Ahire Marg, Mumbai",
    totalContributions: 1000000,
    onboardingDate: "2025-03-20",
    contacts: [
      { id: "contact4", name: "Rajashree Birla", role: "Chairperson, Aditya Birla Foundation", email: "rajashree@adityabirla.com", phone: "+91 9876543213" }
    ],
    documents: [
      { id: "doc5", label: "CSR Policy", type: "Policy", uploadedDate: "2025-03-20" }
    ],
    programs: [
      { id: "prog3", name: "Education for All", contribution: 500000, date: "2025-03-25" },
      { id: "prog5", name: "Healthcare Initiative", contribution: 500000, date: "2025-04-10" }
    ]
  }
};

export default function DonorDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const donorId = params.id as string;
  
  const [donor, setDonor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  // Fetch donor data
  useEffect(() => {
    // In a real application, we would make an API call here
    // For now, we'll use the mock data
    
    const fetchDonor = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const donorData = MOCK_DONORS[donorId as keyof typeof MOCK_DONORS];
        
        if (!donorData) {
          setError("Donor not found");
          return;
        }
        
        setDonor(donorData);
      } catch (error) {
        setError("Failed to fetch donor details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDonor();
  }, [donorId]);
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-pulse flex space-x-4 justify-center">
              <div className="rounded-full bg-slate-200 h-12 w-12"></div>
              <div className="flex-1 space-y-4 max-w-lg">
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-gray-500">Loading donor details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error || !donor) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <Heart className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{error || "Donor not found"}</h3>
            <div className="mt-6">
              <Link
                href="/donors"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Donors
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link 
              href="/donors" 
              className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
            >
              <ChevronLeft className="h-5 w-5" />
              Back to Donors
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Heart className="h-6 w-6 mr-2 text-red-500" />
              Donor Details
            </h1>
          </div>
          <Link
            href={`/donors/edit/${donor.id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Donor
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-800">Donor Information</h2>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">{donor.name}</h3>
                  <span
                    className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      donor.type === "INDIVIDUAL"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {donor.type === "INDIVIDUAL" ? "Individual" : "Legal Entity"}
                  </span>
                </div>
                
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {donor.type === "LEGAL_ENTITY" && (
                    <>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Key Contact Person</dt>
                        <dd className="mt-1 text-sm text-gray-900">{donor.keyContact}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Role of Key Contact</dt>
                        <dd className="mt-1 text-sm text-gray-900">{donor.keyContactRole || "—"}</dd>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-gray-400" />
                      Email
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{donor.email}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-gray-400" />
                      Phone
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{donor.phone || "—"}</dd>
                  </div>
                  
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      Address
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{donor.address || "—"}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      Onboarding Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(donor.onboardingDate)}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Contributions</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-semibold text-blue-600">
                      {formatCurrency(donor.totalContributions)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            {/* Programs Funded Card */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-800">
                  Programs Funded by {donor.name}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Program Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Contribution
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donor.programs.map((program: any) => (
                      <tr key={program.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{program.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(program.contribution)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(program.date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/programs/${program.id}`}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            View
                            <ExternalLink className="ml-1 h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {donor.programs.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">No programs funded yet.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Additional Contacts Card */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-800">Additional Contacts</h2>
              </div>
              <div className="p-6">
                {donor.contacts.length > 0 ? (
                  <div className="space-y-4">
                    {donor.contacts.map((contact: any) => (
                      <div key={contact.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <h3 className="text-sm font-medium text-gray-900">{contact.name}</h3>
                        {contact.role && <p className="text-xs text-gray-500 mt-1">{contact.role}</p>}
                        
                        <div className="mt-2 flex flex-col space-y-1">
                          {contact.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1 text-gray-400" />
                              <span className="text-gray-600">{contact.email}</span>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1 text-gray-400" />
                              <span className="text-gray-600">{contact.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No additional contacts added.</p>
                )}
              </div>
            </div>
            
            {/* Onboarding Documents Card */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-800">Onboarding Documents</h2>
              </div>
              <div className="p-6">
                {donor.documents.length > 0 ? (
                  <div className="space-y-4">
                    {donor.documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-start">
                        <div className="h-9 w-9 flex-shrink-0 bg-blue-50 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900">{doc.label}</h3>
                          <div className="flex text-xs text-gray-500 mt-1">
                            <span className="mr-2">{doc.type}</span>
                            <span>Uploaded: {formatDate(doc.uploadedDate)}</span>
                          </div>
                          <button
                            type="button"
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-flex items-center"
                          >
                            View Document
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No documents uploaded.</p>
                )}
              </div>
            </div>
            
            {/* Activity Log Placeholder */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-800">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <PenTool className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Made contribution to <span className="font-medium">Rural Entrepreneurship Initiative</span></p>
                      <p className="text-xs text-gray-500">2 months ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Added document <span className="font-medium">ID Proof</span></p>
                      <p className="text-xs text-gray-500">3 months ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Heart className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Donor was created</p>
                      <p className="text-xs text-gray-500">4 months ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
