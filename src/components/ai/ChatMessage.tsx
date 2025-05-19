"use client";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"} mb-4`}>
      <div 
        className={`px-4 py-2 rounded-lg max-w-[75%] ${
          role === "user" 
            ? "bg-blue-600 text-white rounded-br-none" 
            : "bg-gray-100 text-gray-800 rounded-bl-none"
        }`}
      >
        <p className="text-sm">{content}</p>
        <p className={`text-xs mt-1 text-right ${role === "user" ? "text-blue-100" : "text-gray-500"}`}>
          {formatTime(timestamp)}
        </p>
      </div>
    </div>
  );
}
