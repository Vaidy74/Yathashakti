import { Loader2 } from 'lucide-react';

interface RecentActivitiesProps {
  isLoading?: boolean;
}

// Activity types for recent activities
type ActivityType = 'grant_created' | 'grant_updated' | 'grant_disbursed' | 'program_created' | 'service_provider_added';

// Mock activity data
interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  user: {
    name: string;
    role: string;
  };
  details?: {
    [key: string]: any;
  };
}

export default function RecentActivities({ isLoading = false }: RecentActivitiesProps) {
  // Mock data for recent activities
  const recentActivities: Activity[] = [
    {
      id: 'act-001',
      type: 'grant_disbursed',
      description: 'Disbursed ₹2.5L to Agrarian Innovations Fund',
      timestamp: '2025-05-21T10:15:30Z',
      user: {
        name: 'Priya Sharma',
        role: 'Finance Manager'
      },
      details: {
        grantId: 'G-2025-042',
        amount: 250000,
        program: 'Rural Entrepreneurship'
      }
    },
    {
      id: 'act-002',
      type: 'service_provider_added',
      description: 'Added new service provider "TechSeva Solutions"',
      timestamp: '2025-05-21T09:45:12Z',
      user: {
        name: 'Rahul Patel',
        role: 'Program Manager'
      },
      details: {
        providerId: 'SP-2025-018',
        category: 'Technology',
        location: 'Bangalore'
      }
    },
    {
      id: 'act-003',
      type: 'grant_created',
      description: 'Created new grant for "Women Artisan Collective"',
      timestamp: '2025-05-20T16:34:21Z',
      user: {
        name: 'Anjali Desai',
        role: 'Grant Officer'
      },
      details: {
        grantId: 'G-2025-041',
        amount: 350000,
        program: 'Women Entrepreneurship'
      }
    },
    {
      id: 'act-004',
      type: 'program_created',
      description: 'Launched new program "Digital Literacy for Rural Youth"',
      timestamp: '2025-05-19T14:22:45Z',
      user: {
        name: 'Vikram Singh',
        role: 'Program Director'
      },
      details: {
        programId: 'P-2025-007',
        budget: 5000000,
        duration: '2 years'
      }
    },
    {
      id: 'act-005',
      type: 'grant_updated',
      description: 'Updated reporting schedule for "Clean Water Initiative"',
      timestamp: '2025-05-19T11:08:33Z',
      user: {
        name: 'Deepak Kumar',
        role: 'Program Manager'
      },
      details: {
        grantId: 'G-2025-032',
        changes: ['reporting schedule', 'milestone targets']
      }
    }
  ];

  // Get the appropriate icon for activity type
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'grant_created':
        return (
          <div className="p-2 rounded-full bg-green-100">
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'grant_updated':
        return (
          <div className="p-2 rounded-full bg-yellow-100">
            <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'grant_disbursed':
        return (
          <div className="p-2 rounded-full bg-blue-100">
            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      case 'program_created':
        return (
          <div className="p-2 rounded-full bg-purple-100">
            <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        );
      case 'service_provider_added':
        return (
          <div className="p-2 rounded-full bg-indigo-100">
            <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-full bg-gray-100">
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return `${diffDay}d ago`;
    } else if (diffHour > 0) {
      return `${diffHour}h ago`;
    } else if (diffMin > 0) {
      return `${diffMin}m ago`;
    } else {
      return 'Just now';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {recentActivities.map((activity) => (
        <div key={activity.id} className="py-4 flex">
          <div className="mr-4">
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {activity.description}
            </p>
            <p className="text-sm text-gray-500 truncate">
              by {activity.user.name} • {activity.user.role}
            </p>
          </div>
          <div className="text-xs text-gray-500">
            {formatRelativeTime(activity.timestamp)}
          </div>
        </div>
      ))}
      
      <div className="pt-4 text-center">
        <button className="text-sm text-blue-600 hover:text-blue-800">
          View All Activities
        </button>
      </div>
    </div>
  );
}
