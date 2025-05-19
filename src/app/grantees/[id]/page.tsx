"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ChevronLeft, User, MapPin, Phone, Mail, 
  Calendar, FileText, Edit, Trash, Download,
  Loader2, AlertCircle
} from "lucide-react";
import GranteeDetailTabs from "@/components/grantees/GranteeDetailTabs";
import { GranteeDetail } from "@/types/grantee";

// Mock grantee data (in a real app, this would come from an API)
const MOCK_GRANTEES = [
  {
    id: "1",
    name: "Rajesh Kumar",
    gender: "Male",
    dateOfBirth: "1985-06-15",
    phone: "+91 98765 43210",
    email: "rajesh.kumar@example.com",
    address: "123 Village Road",
    village: "Chandpur",
    district: "Alwar",
    state: "Rajasthan",
    pincode: "301001",
    idType: "Aadhaar Card",
    idNumber: "XXXX-XXXX-1234",
    sector: "Agriculture",
    programs: ["Rural Entrepreneurship Initiative"],
    grants: [
      {
        id: "g1",
        amount: 50000,
        disbursedDate: "2022-04-10",
        status: "Active",
        programId: "p1",
        programName: "Rural Entrepreneurship Initiative",
        repaymentStatus: "On Schedule",
        repaid: 15000,
        nextPaymentDue: "2023-01-15",
        nextPaymentAmount: 5000
      }
    ],
    documents: [
      { id: "d1", type: "ID Proof", name: "Aadhaar Card.pdf", uploadDate: "2022-03-15" },
      { id: "d2", type: "Business Plan", name: "Agriculture Business Plan.pdf", uploadDate: "2022-03-20" }
    ],
    notes: [
      { id: "n1", text: "Initial meeting with Rajesh to discuss his farming plans.", date: "2022-03-10", author: "Ananya Singh" },
      { id: "n2", text: "Verified land ownership documents and field visit completed.", date: "2022-03-18", author: "Vikram Mehta" }
    ]
  },
  {
    id: "2",
    name: "Meera Devi",
    gender: "Female",
    dateOfBirth: "1990-08-22",
    phone: "+91 98765 43211",
    email: "meera.devi@example.com",
    address: "45 Main Road",
    village: "Bansur",
    district: "Alwar",
    state: "Rajasthan",
    pincode: "301002",
    idType: "Voter ID",
    idNumber: "ABCD1234XYZ",
    sector: "Handicrafts",
    programs: ["Women Empowerment Program"],
    grants: [
      {
        id: "g2",
        amount: 35000,
        disbursedDate: "2022-05-20",
        status: "Active",
        programId: "p2",
        programName: "Women Empowerment Program",
        repaymentStatus: "On Schedule",
        repaid: 10000,
        nextPaymentDue: "2023-01-20",
        nextPaymentAmount: 3000
      }
    ],
    documents: [
      { id: "d3", type: "ID Proof", name: "Voter ID.pdf", uploadDate: "2022-04-15" },
      { id: "d4", type: "Business Photos", name: "Handicraft Samples.zip", uploadDate: "2022-04-28" }
    ],
    notes: [
      { id: "n3", text: "Meera has been producing handicrafts for 5 years and wishes to expand.", date: "2022-04-10", author: "Ananya Singh" },
      { id: "n4", text: "Market assessment for her products completed. Good potential for online sales.", date: "2022-04-25", author: "Priya Sharma" }
    ]
  }
];

export default function GranteeDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [grantee, setGrantee] = useState<GranteeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchGrantee = async () => {
      if (!id || typeof id !== 'string') {
        setError("Invalid grantee ID");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/grantees/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Grantee not found");
          } else {
            throw new Error(`Error: ${response.status}`);
          }
          return;
        }
        
        const data = await response.json();
        setGrantee(data);
      } catch (err) {
        setError("Error fetching grantee details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchGrantee();
    }
  }, [id]);
  
  // Handle grantee deletion
  const handleDelete = async () => {
    if (!id || !grantee) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/grantees/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Redirect back to grantees list
      router.push('/grantees');
    } catch (err) {
      console.error('Error deleting grantee:', err);
      setError('Failed to delete grantee. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !grantee) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Link 
              href="/grantees" 
              className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
            >
              <ChevronLeft className="h-5 w-5" />
              Back to Grantees
            </Link>
          </div>
          
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error || "Grantee not found"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header with back button and actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <Link 
              href="/grantees" 
              className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
            >
              <ChevronLeft className="h-5 w-5" />
              Back to Grantees
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">{grantee.name}</h1>
          </div>
          
          <div className="flex space-x-3">
            <Link 
              href={`/grantees/${id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Profile Summary Card */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row">
              {/* Avatar Placeholder */}
              <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 uppercase text-xl font-bold">
                  {grantee.name.split(' ').map(name => name[0]).join('')}
                </div>
              </div>
              
              {/* Grantee Summary */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-900">
                      {grantee.name} {grantee.gender ? `(${grantee.gender})` : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-600">
                      {[grantee.village, grantee.district, grantee.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <Phone className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-600">{grantee.phone}</span>
                  </div>
                  
                  {grantee.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-gray-600">{grantee.email}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-900">
                      {grantee.idType && grantee.idNumber ? `${grantee.idType}: ${grantee.idNumber}` : 'No ID information'}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-600">
                      DOB: {grantee.dateOfBirth ? new Date(grantee.dateOfBirth).toLocaleDateString() : 'Not available'}
                    </span>
                  </div>
                  
                  {grantee.sector && (
                    <div className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mb-2 inline-block">
                      {grantee.sector}
                    </div>
                  )}
                  
                  {grantee.programs?.map((program, index) => (
                    <div key={index} className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded mb-2 inline-block ml-1">
                      {program}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Grant Summary */}
              <div className="flex-shrink-0 mt-4 md:mt-0 bg-gray-50 p-4 rounded-md md:ml-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Grant Summary</h3>
                
                <div className="mb-2">
                  <p className="text-sm text-gray-500">Total Grant Amount</p>
                  <p className="text-lg font-medium text-gray-900">
                    ₹{grantee.grants?.reduce((sum, grant) => sum + (grant.amount || 0), 0).toLocaleString() || '0'}
                  </p>
                </div>
                
                <div className="mb-2">
                  <p className="text-sm text-gray-500">Repaid</p>
                  <p className="text-lg font-medium text-green-600">
                    ₹{grantee.grants?.reduce((sum, grant) => sum + (grant.repaid || 0), 0).toLocaleString() || '0'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Next Payment Due</p>
                  <p className="text-base text-gray-900">
                    {grantee.grants && grantee.grants[0]?.nextPaymentDue 
                      ? new Date(grantee.grants[0].nextPaymentDue).toLocaleDateString() 
                      : "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    ₹{grantee.grants && grantee.grants[0]?.nextPaymentAmount?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for additional information */}
        <GranteeDetailTabs grantee={grantee} />
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="flex items-center justify-center">
                  <AlertCircle className="h-16 w-16 text-red-500" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2">Confirm Deletion</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete {grantee.name}? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <span className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </span>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
