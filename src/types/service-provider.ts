export interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  type: ServiceProviderType;
  contactPerson: string | null;
  contactNumber: string | null;
  email: string | null;
  location: string | null;
  description: string | null;
  website: string | null;
  services: string[];
  ratePerDay: number | null;
  registeredOn: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum ServiceProviderType {
  IMPLEMENTING_PARTNER_SELF = 'IMPLEMENTING_PARTNER_SELF',
  IMPLEMENTING_PARTNER_THIRD_PARTY = 'IMPLEMENTING_PARTNER_THIRD_PARTY',
  ME_PARTNER_THIRD_PARTY = 'ME_PARTNER_THIRD_PARTY'
}

export type ServiceProviderFormData = Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt' | 'registeredOn'> & {
  registeredOn?: Date;
};

// For response from the API when including related data
export interface ServiceProviderDocument {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  description?: string | null;
  uploadedAt: Date;
  serviceProviderId: string;
}

export interface ServiceProviderWithRelations extends ServiceProvider {
  programs?: Array<{
    id: string;
    name: string;
  }>;
  grants?: Array<{
    id: string;
    grantIdentifier: string;
    amount: number;
    status?: string;
    grantee?: {
      id: string;
      name: string;
    };
  }>;
  documents?: ServiceProviderDocument[];
}

export interface ServiceProviderPerformance {
  overview: {
    totalGrants: number;
    activeGrants: number;
    completedGrants: number;
    totalGrantAmount: number;
    uniqueProgramsCount: number;
    activeProgramsCount: number;
  };
  repaymentPerformance: {
    totalRepaymentExpected: number;
    totalRepaymentReceived: number;
    repaymentRate: number;
    overdueInstallments: number;
  };
  recentActivity: {
    recentGrants: number;
    recentCommunications: number;
    lastActive: string | null;
  };
  programPerformance: Array<{
    programId: string;
    programName: string;
    grantsCount: number;
    totalAmount: number;
    activeGrants: number;
    completedGrants: number;
  }>;
}
