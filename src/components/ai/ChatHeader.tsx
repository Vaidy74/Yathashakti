"use client";

import { Minimize2, Maximize2, X } from "lucide-react";

interface ChatHeaderProps {
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
}

export default function ChatHeader({ isMinimized, onMinimize, onClose }: ChatHeaderProps) {
  return (
    <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center rounded-t-lg">
      <div className="flex items-center">
        <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
        <h3 className="font-medium">Yathashakti AI Assistant</h3>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={onMinimize} 
          className="text-white/80 hover:text-white transition-colors"
          aria-label={isMinimized ? "Maximize" : "Minimize"}
        >
          {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </button>
        <button 
          onClick={onClose} 
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
