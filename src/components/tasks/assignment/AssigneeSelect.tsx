'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, Search, X, UserPlus, Users, Check } from 'lucide-react';
import { useOutsideClick } from '@/utils/hooks/useOutsideClick';
import Image from 'next/image';

export interface UserOption {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AssigneeSelectProps {
  currentAssigneeId: string | null;
  onAssigneeChange: (userId: string | null) => Promise<void>;
  taskId: string;
  className?: string;
}

const AssigneeSelect: React.FC<AssigneeSelectProps> = ({
  currentAssigneeId,
  onAssigneeChange,
  taskId,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useOutsideClick(dropdownRef, () => setIsOpen(false));

  // Fetch users when the dropdown is opened
  useEffect(() => {
    if (isOpen && users.length === 0) {
      fetchUsers();
    }
  }, [isOpen]);

  // Fetch the current assignee details
  useEffect(() => {
    if (currentAssigneeId) {
      fetchCurrentAssignee();
    } else {
      setSelectedUser(null);
    }
  }, [currentAssigneeId]);

  const fetchCurrentAssignee = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${currentAssigneeId}`);
      
      if (response.ok) {
        const user = await response.json();
        setSelectedUser(user);
      } else {
        console.error('Failed to fetch current assignee');
      }
    } catch (error) {
      console.error('Error fetching current assignee:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/users');
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = async (user: UserOption | null) => {
    try {
      setIsAssigning(true);
      await onAssigneeChange(user?.id || null);
      setSelectedUser(user);
      setIsOpen(false);
    } catch (error) {
      console.error('Error assigning user:', error);
      setError('Failed to assign user');
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredUsers = searchQuery.trim() === '' 
    ? users 
    : users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Current assignee display / trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm text-gray-700 hover:text-blue-600 group transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
          ) : selectedUser ? (
            <div className="flex items-center">
              {selectedUser.avatar ? (
                <Image
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full mr-2"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
              )}
              <div className="ml-2">
                <div className="font-medium">{selectedUser.name}</div>
                <div className="text-xs text-gray-500">{selectedUser.email}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center text-gray-500">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <span>Unassigned</span>
            </div>
          )}
          <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <UserPlus className="h-4 w-4 text-blue-600" />
          </div>
        </div>
      </button>

      {/* Dropdown for user selection */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="p-2">
            <div className="relative mb-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="py-2 px-3 text-gray-500 text-sm flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                Loading users...
              </div>
            ) : error ? (
              <div className="py-2 px-3 text-red-500 text-sm">{error}</div>
            ) : (
              <>
                <ul className="max-h-60 overflow-auto py-1" role="listbox">
                  <li className="relative py-2 pl-3 pr-9 cursor-pointer hover:bg-gray-100 rounded-md">
                    <div
                      className="flex items-center"
                      onClick={() => handleUserSelect(null)}
                    >
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <X className="h-3 w-3 text-gray-500" />
                      </div>
                      <span className="ml-3 block font-medium text-gray-900 truncate">
                        Unassign
                      </span>
                      {currentAssigneeId === null && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <Check className="h-4 w-4 text-blue-600" />
                        </span>
                      )}
                    </div>
                  </li>
                  
                  {filteredUsers.length === 0 ? (
                    <li className="relative py-2 px-3 text-gray-500 text-sm">
                      No users found
                    </li>
                  ) : (
                    filteredUsers.map((user) => (
                      <li
                        key={user.id}
                        className="relative py-2 pl-3 pr-9 cursor-pointer hover:bg-gray-100 rounded-md"
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="flex items-center">
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.name}
                              width={24}
                              height={24}
                              className="h-6 w-6 rounded-full"
                            />
                          ) : (
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-3 w-3 text-blue-600" />
                            </div>
                          )}
                          <span className="ml-3 block font-medium text-gray-900 truncate">
                            {user.name}
                          </span>
                          <span className="ml-1 block text-xs text-gray-500 truncate">
                            {user.email}
                          </span>
                          {currentAssigneeId === user.id && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                              <Check className="h-4 w-4 text-blue-600" />
                            </span>
                          )}
                        </div>
                      </li>
                    ))
                  )}
                </ul>
                
                <div className="mt-1 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 px-3">
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {users.length} users
                  </span>
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => fetchUsers()}
                  >
                    Refresh
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssigneeSelect;
