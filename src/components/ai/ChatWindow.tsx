"use client";

import { useState, useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  onClose: () => void;
}

export default function ChatWindow({ onClose }: ChatWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Yathashakti AI assistant. I can help you with grant management, generate reports, analyze data, and answer questions. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keep track of the model being used
  const [currentModel, setCurrentModel] = useState<string>("");

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized]);

  // Generate AI response using the API
  const generateAIResponse = async (userMessage: string) => {
    try {
      // Prepare the conversation history to send to the API
      const conversationHistory = messages
        .filter(msg => msg.role === "user" || msg.role === "assistant")
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Call our API endpoint which connects to OpenRouter
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from API');
      }

      const data = await response.json();
      
      // Update the model info if available
      if (data.model) {
        setCurrentModel(data.model);
      }
      
      return data.content;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return "I'm sorry, I encountered an error while processing your request. Please try again later.";
    }
  };

  // Handle new message from user
  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage = {
      role: "user" as const,
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Get response from AI
      const responseContent = await generateAIResponse(content);
      
      const aiResponse = {
        role: "assistant" as const,
        content: responseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error in chat:', error);
      // Add error message
      const errorResponse = {
        role: "assistant" as const,
        content: "I'm sorry, I encountered an error. Please try again later.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-xl z-50 transition-all duration-300 ${
      isMinimized ? 'w-64 h-14' : 'w-96 h-[500px]'
    }`}>
      <ChatHeader 
        isMinimized={isMinimized} 
        onMinimize={toggleMinimize} 
        onClose={onClose} 
      />
      
      {!isMinimized && (
        <>
          <div className="p-4 h-[400px] overflow-y-auto">
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div>
            {currentModel && (
              <div className="px-3 py-1 bg-gray-50 border-t text-xs text-gray-500">
                Powered by {currentModel.split('/').pop()}
              </div>
            )}
            <ChatInput 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading} 
            />
          </div>
        </>
      )}
    </div>
  );
}
