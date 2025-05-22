'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useSession } from 'next-auth/react';
import { Bell, Clock, Save } from 'lucide-react';

interface NotificationSettings {
  id: string;
  userId: string;
  emailTaskReminders: boolean;
  inAppTaskReminders: boolean;
  emailRepaymentReminders: boolean;
  inAppRepaymentReminders: boolean;
  emailGrantUpdates: boolean;
  inAppGrantUpdates: boolean;
  emailProgramUpdates: boolean;
  inAppProgramUpdates: boolean;
  reminderLeadTime: number;
}

export default function NotificationSettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch user notification settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${session.user.id}/notification-settings`);
        
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else {
          // If settings don't exist yet, create default settings
          setSettings({
            id: '',
            userId: session.user.id,
            emailTaskReminders: true,
            inAppTaskReminders: true,
            emailRepaymentReminders: true,
            inAppRepaymentReminders: true,
            emailGrantUpdates: true,
            inAppGrantUpdates: true,
            emailProgramUpdates: true,
            inAppProgramUpdates: true,
            reminderLeadTime: 24,
          });
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [session]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id || !settings) return;
    
    try {
      setSaving(true);
      
      const response = await fetch(`/api/users/${session.user.id}/notification-settings`, {
        method: settings.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setMessage({ type: 'success', text: 'Notification settings saved successfully!' });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setMessage({ type: 'error', text: 'Failed to save notification settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Handle toggle changes
  const handleToggleChange = (field: keyof NotificationSettings) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [field]: !settings[field],
    });
  };

  // Handle reminder lead time change
  const handleLeadTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      reminderLeadTime: parseInt(e.target.value, 10),
    });
  };

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Bell className="mr-3 h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
        </div>
        
        {loading ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-6 py-1">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-4 bg-gray-200 rounded col-span-2"></div>
                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Message alert */}
            {message && (
              <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message.text}
              </div>
            )}
            
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">Task Notifications</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Configure how you receive task-related notifications.
                </p>
              </div>
              
              <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">In-app Task Reminders</h3>
                      <p className="text-sm text-gray-500">
                        Receive notifications within the app for upcoming tasks
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings?.inAppTaskReminders}
                        onChange={() => handleToggleChange('inAppTaskReminders')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Email Task Reminders</h3>
                      <p className="text-sm text-gray-500">
                        Receive email notifications for upcoming tasks
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings?.emailTaskReminders}
                        onChange={() => handleToggleChange('emailTaskReminders')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Reminder Lead Time</h3>
                        <p className="text-sm text-gray-500">
                          How far in advance you want to be reminded of upcoming tasks
                        </p>
                      </div>
                    </div>
                    <select
                      value={settings?.reminderLeadTime}
                      onChange={handleLeadTimeChange}
                      className="mt-1 block w-1/4 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value={1}>1 hour</option>
                      <option value={2}>2 hours</option>
                      <option value={4}>4 hours</option>
                      <option value={8}>8 hours</option>
                      <option value={12}>12 hours</option>
                      <option value={24}>1 day</option>
                      <option value={48}>2 days</option>
                      <option value={72}>3 days</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">Financial Notifications</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Configure how you receive repayment and grant-related notifications.
                </p>
              </div>
              
              <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">In-app Repayment Reminders</h3>
                      <p className="text-sm text-gray-500">
                        Receive notifications within the app for upcoming repayments
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings?.inAppRepaymentReminders}
                        onChange={() => handleToggleChange('inAppRepaymentReminders')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Email Repayment Reminders</h3>
                      <p className="text-sm text-gray-500">
                        Receive email notifications for upcoming repayments
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings?.emailRepaymentReminders}
                        onChange={() => handleToggleChange('emailRepaymentReminders')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">Program Notifications</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Configure how you receive program and grant update notifications.
                </p>
              </div>
              
              <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">In-app Grant Updates</h3>
                      <p className="text-sm text-gray-500">
                        Receive notifications within the app for grant status changes
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings?.inAppGrantUpdates}
                        onChange={() => handleToggleChange('inAppGrantUpdates')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Email Grant Updates</h3>
                      <p className="text-sm text-gray-500">
                        Receive email notifications for grant status changes
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings?.emailGrantUpdates}
                        onChange={() => handleToggleChange('emailGrantUpdates')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">In-app Program Updates</h3>
                      <p className="text-sm text-gray-500">
                        Receive notifications within the app for program changes
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings?.inAppProgramUpdates}
                        onChange={() => handleToggleChange('inAppProgramUpdates')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Email Program Updates</h3>
                      <p className="text-sm text-gray-500">
                        Receive email notifications for program changes
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings?.emailProgramUpdates}
                        onChange={() => handleToggleChange('emailProgramUpdates')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
