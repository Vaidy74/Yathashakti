"use client";

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2 } from 'lucide-react';
// Removed session dependency for simpler implementation
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AssistantBotProps {
  appState?: {
    isEmpty?: boolean;
    currentPage?: string;
    totalGrants?: number;
    totalPrograms?: number;
  };
}

export default function AssistantBot({ appState }: AssistantBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Generate initial greeting and suggestion based on app state
  useEffect(() => {
    // Initial greeting message
    const initialMessage = {
      role: 'assistant' as const,
      content: generateInitialGreeting(),
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [appState]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateInitialGreeting = () => {
    const userName = 'there';
    
    if (appState?.isEmpty) {
      return `Hi ${userName}! Welcome to Yathashakti. I notice your database is empty. Would you like help setting up your first grant or program?`;
    } else if (appState?.totalGrants === 0) {
      return `Hi ${userName}! I see you're getting set up with Yathashakti. Would you like help creating your first grant?`;
    } else if (appState?.totalPrograms === 0 && appState?.totalGrants && appState.totalGrants > 0) {
      return `Hi ${userName}! I notice you have grants but no programs yet. Would you like to create your first program?`;
    } else {
      return `Hi ${userName}! How can I help you with Yathashakti today?`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Make API call to the assistant
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          history: messages,
          context: {
            isEmpty: appState?.isEmpty,
            currentPage: appState?.currentPage,
            totalGrants: appState?.totalGrants,
            totalPrograms: appState?.totalPrograms,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from assistant');
      }

      const data = await response.json();

      // Add assistant response
      const assistantMessage = {
        role: 'assistant' as const,
        content: data.result,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error getting assistant response:', error);
      toast.error('Sorry, I had trouble responding. Please try again.');
      
      // Add error message from assistant
      const errorMessage = {
        role: 'assistant' as const,
        content: "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (isMinimized) setIsMinimized(false);
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Chat button */}
      <button
        onClick={toggleOpen}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Open assistant chat"
      >
        <MessageSquare size={20} />
      </button>

      {/* Chat window */}
      {isOpen && (
        <div 
          className={`bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden mt-2 transition-all duration-200 ease-in-out ${
            isMinimized ? 'w-64 h-12' : 'w-80 sm:w-96 h-96'
          }`}
        >
          {/* Chat header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-medium text-sm">Yathashakti Assistant</h3>
            <div className="flex items-center space-x-2">
              <button onClick={toggleMinimize} className="text-white/80 hover:text-white">
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Chat messages */}
              <div className="p-3 overflow-y-auto h-[calc(100%-7rem)] bg-gray-50">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-3 max-w-[85%] ${
                      msg.role === 'user' ? 'ml-auto' : 'mr-auto'
                    }`}
                  >
                    <div
                      className={`rounded-lg p-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-200 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div
                      className={`text-xs text-gray-500 mt-1 ${
                        msg.role === 'user' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center space-x-2 mb-3 max-w-[85%] mr-auto">
                    <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Chat input */}
              <form onSubmit={handleSubmit} className="border-t p-2 flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="ml-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!input.trim() || isLoading}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
