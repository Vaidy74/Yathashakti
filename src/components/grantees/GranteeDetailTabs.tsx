import { useState } from "react";
import { 
  CreditCard, FileText, MessageSquare, Clock,
  Download, Edit, Plus, AlertCircle, Trash
} from "lucide-react";

const GranteeDetailTabs = ({ grantee }) => {
  const [activeTab, setActiveTab] = useState("grants");

  // Format currency values
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate progress percentage for repayment
  const calculateProgress = (repaid, total) => {
    return (repaid / total) * 100;
  };

  // Return the tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "grants":
        return (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Grants & Repayments</h3>
              <button className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Grant
              </button>
            </div>

            {grantee.grants.length === 0 ? (
              <div className="bg-gray-50 p-4 text-center rounded-md">
                <p className="text-gray-600">No grants found for this grantee</p>
              </div>
            ) : (
              <div className="space-y-6">
                {grantee.grants.map((grant) => (
                  <div 
                    key={grant.id} 
                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                  >
                    {/* Grant Header */}
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">
                        {grant.programName}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-2">
                        <span>
                          Grant Amount: <span className="font-medium">{formatCurrency(grant.amount)}</span>
                        </span>
                        <span>•</span>
                        <span>
                          Status: <span className={`font-medium ${
                            grant.status === "Active" ? "text-green-600" : "text-gray-600"
                          }`}>{grant.status}</span>
                        </span>
                        <span>•</span>
                        <span>
                          Disbursed: <span className="font-medium">{formatDate(grant.disbursedDate)}</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Grant Details */}
                    <div className="px-4 py-5 sm:px-6">
                      {/* Repayment Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Repayment Progress</span>
                          <span className="text-sm font-medium text-gray-700">
                            {formatCurrency(grant.repaid)} of {formatCurrency(grant.amount)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${calculateProgress(grant.repaid, grant.amount)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Next Payment */}
                      <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Clock className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Next Payment Due</h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p className="font-medium">{formatDate(grant.nextPaymentDue)}</p>
                              <p>{formatCurrency(grant.nextPaymentAmount)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex space-x-3">
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Record Payment
                        </button>
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Grant
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "documents":
        return (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Documents</h3>
              <button className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </button>
            </div>

            {grantee.documents.length === 0 ? (
              <div className="bg-gray-50 p-4 text-center rounded-md">
                <p className="text-gray-600">No documents found for this grantee</p>
              </div>
            ) : (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <ul className="divide-y divide-gray-200">
                  {grantee.documents.map((document) => (
                    <li key={document.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{document.name}</div>
                            <div className="text-sm text-gray-500">
                              {document.type} • Uploaded {formatDate(document.uploadDate)}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Download className="h-5 w-5" />
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case "notes":
        return (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Notes & Communication</h3>
              <button className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </button>
            </div>

            {/* Add Note Form */}
            <div className="mb-4 bg-white rounded-lg shadow p-4">
              <textarea
                rows={3}
                placeholder="Add a note about this grantee..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <div className="mt-3 flex justify-end">
                <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Save Note
                </button>
              </div>
            </div>

            {/* Notes List */}
            {grantee.notes.length === 0 ? (
              <div className="bg-gray-50 p-4 text-center rounded-md">
                <p className="text-gray-600">No notes found for this grantee</p>
              </div>
            ) : (
              <div className="space-y-4">
                {grantee.notes.map((note) => (
                  <div key={note.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4">
                      <p className="text-gray-800 text-sm">{note.text}</p>
                      <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                        <span>By {note.author} on {formatDate(note.date)}</span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "personal":
        return (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="px-4 py-5 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{grantee.name}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Gender</dt>
                      <dd className="mt-1 text-sm text-gray-900">{grantee.gender}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(grantee.dateOfBirth)}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{grantee.phone}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                      <dd className="mt-1 text-sm text-gray-900">{grantee.email || "Not provided"}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">ID Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{grantee.idType}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">ID Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{grantee.idNumber}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <dt className="text-sm font-medium text-gray-500 mb-2">Address</dt>
                  <dd className="text-sm text-gray-900 mb-4">
                    {grantee.address && <p>{grantee.address},</p>}
                    <p>{grantee.village}, {grantee.district}</p>
                    <p>{grantee.state} {grantee.pincode}</p>
                  </dd>
                  
                  <dt className="text-sm font-medium text-gray-500 mb-2">Business/Venture</dt>
                  <dd className="text-sm text-gray-900">
                    <p>Sector: {grantee.sector}</p>
                    <p className="mt-1">Programs: {grantee.programs.join(", ")}</p>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex overflow-x-auto">
          <button
            className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === "grants"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("grants")}
          >
            <CreditCard className="h-5 w-5 inline-block mr-2" />
            Grants & Repayments
          </button>
          <button
            className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === "documents"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("documents")}
          >
            <FileText className="h-5 w-5 inline-block mr-2" />
            Documents
          </button>
          <button
            className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === "notes"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("notes")}
          >
            <MessageSquare className="h-5 w-5 inline-block mr-2" />
            Notes & Communication
          </button>
          <button
            className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === "personal"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("personal")}
          >
            <AlertCircle className="h-5 w-5 inline-block mr-2" />
            Personal Details
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default GranteeDetailTabs;
