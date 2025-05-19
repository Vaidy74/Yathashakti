import { NextResponse } from 'next/server';

// Environment variable for OpenRouter API key would be set in .env.local
// OPENROUTER_API_KEY=your_api_key_here

export async function POST(request: Request) {
  try {
    const { message, conversationHistory } = await request.json();
    
    // Prepare the conversation history for the OpenRouter API
    const messages = [
      {
        role: "system",
        content: "You are an AI assistant for Yathashakti, a platform for managing interest-free, morally repayable grants for NGOs and Implementing Organizations. You can help with grant management, generate reports, analyze data, and answer questions about grantees, programs, and financial metrics."
      },
      // Add previous messages from conversation history
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      // Add the current user message
      {
        role: "user",
        content: message
      }
    ];

    // The model to use - for free tier, you might use models like:
    // - "mistralai/mistral-7b-instruct" (Mistral 7B)
    // - "openchat/openchat-7b"
    // - "anthropic/claude-instant-v1" (if available in the free tier)
    const model = "mistralai/mistral-7b-instruct";

    // Call the OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://yathashakti.org', // replace with your actual domain
        'X-Title': 'Yathashakti Platform' // Your application name
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json({ error: "Failed to get response from AI service" }, { status: 500 });
    }

    const data = await response.json();
    
    return NextResponse.json({
      content: data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.",
      model: data.model || model
    });
    
  } catch (error) {
    console.error("Error in AI chat API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
