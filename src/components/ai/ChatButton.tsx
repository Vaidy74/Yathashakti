"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";

interface ChatButtonProps {
  onOpen: () => void;
}

export default function ChatButton({ onOpen }: ChatButtonProps) {
  return (
    <button
      onClick={onOpen}
      className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      aria-label="Open AI Assistant"
    >
      <MessageSquare className="h-6 w-6" />
    </button>
  );
}
