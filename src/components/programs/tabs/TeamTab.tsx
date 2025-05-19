import { useState } from "react";
import { Plus, Trash2, Mail, Phone, AlertCircle, User } from "lucide-react";

// Team roles options
const TEAM_ROLES = [
  "Program Manager",
  "Field Coordinator",
  "Finance Officer",
  "Monitoring & Evaluation Specialist",
  "Community Liaison",
  "Grant Manager",
  "Technical Advisor",
  "Admin Support",
  "Other"
];

const TeamTab = ({ teamMembers, setTeamMembers, errors }) => {
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    organization: "",
    notes: ""
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Reset the new member form
  const resetForm = () => {
    setNewMember({
      name: "",
      email: "",
      phone: "",
      role: "",
      organization: "",
      notes: ""
    });
    setValidationErrors({});
  };

  // Update new member field
  const updateNewMember = (field, value) => {
    setNewMember(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate email format
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate the new member
  const validateMember = () => {
    const errors = {};
    
    if (!newMember.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!newMember.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(newMember.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!newMember.role) {
      errors.role = "Role is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add a new team member
  const addTeamMember = () => {
    if (validateMember()) {
      const updatedMembers = [...teamMembers, { ...newMember, id: Date.now().toString() }];
      setTeamMembers(updatedMembers);
      resetForm();
    }
  };

  // Remove a team member
  const removeTeamMember = (id) => {
    const updatedMembers = teamMembers.filter(member => member.id !== id);
    setTeamMembers(updatedMembers);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-1">Program Team</h2>
        <p className="text-sm text-gray-500">
          Define the team responsible for implementing and managing this program
        </p>
      </div>

      {/* Information Card */}
      <div className="bg-blue-50 p-4 rounded-md flex mb-6">
        <AlertCircle className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-blue-800">Program Team Setup</h4>
          <p className="text-sm text-blue-700 mt-1">
            Add all key stakeholders involved in program implementation, including internal staff, external partners, 
            and technical advisors. Team members will receive notification emails when they are assigned to the program.
          </p>
        </div>
      </div>

      {/* Current Team Members List */}
      {teamMembers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name & Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.map((member, index) => (
                <tr key={member.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Mail className="h-3 w-3 mr-1" />
                      {member.email}
                    </div>
                    {member.phone && (
                      <div className="flex items-center text-sm text-gray-500 mt-0.5">
                        <Phone className="h-3 w-3 mr-1" />
                        {member.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.organization || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => removeTeamMember(member.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Team Member Form */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
          <User className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-base font-medium text-gray-900">Add Team Member</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Member Name */}
            <div>
              <label htmlFor="member-name" className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="member-name"
                value={newMember.name}
                onChange={(e) => updateNewMember("name", e.target.value)}
                className={`mt-1 block w-full border ${
                  validationErrors.name ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Full name"
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
              )}
            </div>

            {/* Member Role */}
            <div>
              <label htmlFor="member-role" className="block text-sm font-medium text-gray-700">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="member-role"
                value={newMember.role}
                onChange={(e) => updateNewMember("role", e.target.value)}
                className={`mt-1 block w-full border ${
                  validationErrors.role ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              >
                <option value="">Select a role</option>
                {TEAM_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {validationErrors.role && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.role}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="member-email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="member-email"
                value={newMember.email}
                onChange={(e) => updateNewMember("email", e.target.value)}
                className={`mt-1 block w-full border ${
                  validationErrors.email ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="email@example.com"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
              )}
            </div>

            {/* Phone Number (Optional) */}
            <div>
              <label htmlFor="member-phone" className="block text-sm font-medium text-gray-700">
                Phone Number (Optional)
              </label>
              <input
                type="text"
                id="member-phone"
                value={newMember.phone}
                onChange={(e) => updateNewMember("phone", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="+91 99999 99999"
              />
            </div>

            {/* Organization */}
            <div className="sm:col-span-2">
              <label htmlFor="member-organization" className="block text-sm font-medium text-gray-700">
                Organization (Optional)
              </label>
              <input
                type="text"
                id="member-organization"
                value={newMember.organization}
                onChange={(e) => updateNewMember("organization", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Company or organization name"
              />
              <p className="mt-1 text-xs text-gray-500">
                For external team members, please specify their organization
              </p>
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label htmlFor="member-notes" className="block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <textarea
                id="member-notes"
                rows={2}
                value={newMember.notes}
                onChange={(e) => updateNewMember("notes", e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Additional information about this team member's role or responsibilities"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={addTeamMember}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </button>
          </div>
        </div>
      </div>

      {/* Team Roles Information */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Common Program Roles</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-gray-800">Program Manager</h5>
            <p className="text-xs text-gray-600 mt-1">
              Oversees the entire program and is accountable for its success. Responsible for strategic decisions and stakeholder management.
            </p>
          </div>
          <div>
            <h5 className="text-sm font-medium text-gray-800">Grant Manager</h5>
            <p className="text-xs text-gray-600 mt-1">
              Handles the revolving grants process, including application reviews, disbursements, and monitoring repayments.
            </p>
          </div>
          <div>
            <h5 className="text-sm font-medium text-gray-800">Field Coordinator</h5>
            <p className="text-xs text-gray-600 mt-1">
              Works directly with beneficiaries in the field, provides training, and collects monitoring data.
            </p>
          </div>
          <div>
            <h5 className="text-sm font-medium text-gray-800">M&E Specialist</h5>
            <p className="text-xs text-gray-600 mt-1">
              Designs and implements the monitoring and evaluation framework, tracking metrics and preparing reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamTab;
