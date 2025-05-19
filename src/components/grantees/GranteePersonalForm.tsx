import { Calendar, User } from "lucide-react";
import { GranteeFormData, FormErrors } from "@/types/grantee";

interface GranteePersonalFormProps {
  data: GranteeFormData;
  updateData: (field: string, value: string) => void;
  errors: FormErrors;
}

// Example list of states for the dropdown
const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

// ID types for verification
const ID_TYPES = [
  "Aadhaar Card",
  "Voter ID",
  "PAN Card",
  "Driving License",
  "Passport",
  "Ration Card"
];

const GranteePersonalForm: React.FC<GranteePersonalFormProps> = ({ data, updateData, errors }) => {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
        <p className="text-sm text-gray-500">Basic information about the grantee</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={data.name}
            onChange={(e) => updateData("name", e.target.value)}
            className={`mt-1 block w-full border ${
              errors.name ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="Full legal name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>
        
        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
            value={data.gender}
            onChange={(e) => updateData("gender", e.target.value)}
            className={`mt-1 block w-full border ${
              errors.gender ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
          )}
        </div>
        
        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={data.phone}
            onChange={(e) => updateData("phone", e.target.value)}
            className={`mt-1 block w-full border ${
              errors.phone ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="+91 99999 99999"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>
        
        {/* Email (Optional) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address (Optional)
          </label>
          <input
            type="email"
            id="email"
            value={data.email}
            onChange={(e) => updateData("email", e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="email@example.com"
          />
        </div>
        
        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              id="dateOfBirth"
              value={data.dateOfBirth}
              onChange={(e) => updateData("dateOfBirth", e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.dateOfBirth ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
          </div>
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>
          )}
        </div>
      </div>
      
      <div className="pt-5 border-t border-gray-200">
        <h3 className="text-md font-medium text-gray-900 mb-4">Address Information</h3>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Address */}
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Street Address 
            </label>
            <input
              type="text"
              id="address"
              value={data.address}
              onChange={(e) => updateData("address", e.target.value)}
              className={`mt-1 block w-full border ${
                errors.address ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="Street address"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-500">{errors.address}</p>
            )}
          </div>
          
          {/* Village/Town */}
          <div>
            <label htmlFor="village" className="block text-sm font-medium text-gray-700">
              Village/Town <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="village"
              value={data.village}
              onChange={(e) => updateData("village", e.target.value)}
              className={`mt-1 block w-full border ${
                errors.village ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="Village or town name"
            />
            {errors.village && (
              <p className="mt-1 text-sm text-red-500">{errors.village}</p>
            )}
          </div>
          
          {/* District */}
          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700">
              District <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="district"
              value={data.district}
              onChange={(e) => updateData("district", e.target.value)}
              className={`mt-1 block w-full border ${
                errors.district ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="District name"
            />
            {errors.district && (
              <p className="mt-1 text-sm text-red-500">{errors.district}</p>
            )}
          </div>
          
          {/* State */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State <span className="text-red-500">*</span>
            </label>
            <select
              id="state"
              value={data.state}
              onChange={(e) => updateData("state", e.target.value)}
              className={`mt-1 block w-full border ${
                errors.state ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            >
              <option value="">Select state</option>
              {STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-red-500">{errors.state}</p>
            )}
          </div>
          
          {/* PIN Code */}
          <div>
            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
              PIN Code
            </label>
            <input
              type="text"
              id="pincode"
              value={data.pincode}
              onChange={(e) => updateData("pincode", e.target.value)}
              className={`mt-1 block w-full border ${
                errors.pincode ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="6-digit PIN code"
            />
            {errors.pincode && (
              <p className="mt-1 text-sm text-red-500">{errors.pincode}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="pt-5 border-t border-gray-200">
        <h3 className="text-md font-medium text-gray-900 mb-4">Identification</h3>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* ID Type */}
          <div>
            <label htmlFor="idType" className="block text-sm font-medium text-gray-700">
              ID Type <span className="text-red-500">*</span>
            </label>
            <select
              id="idType"
              value={data.idType}
              onChange={(e) => updateData("idType", e.target.value)}
              className={`mt-1 block w-full border ${
                errors.idType ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            >
              <option value="">Select ID type</option>
              {ID_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.idType && (
              <p className="mt-1 text-sm text-red-500">{errors.idType}</p>
            )}
          </div>
          
          {/* ID Number */}
          <div>
            <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700">
              ID Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="idNumber"
              value={data.idNumber}
              onChange={(e) => updateData("idNumber", e.target.value)}
              className={`mt-1 block w-full border ${
                errors.idNumber ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="ID document number"
            />
            {errors.idNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.idNumber}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Please enter the full number exactly as it appears on the ID
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GranteePersonalForm;
