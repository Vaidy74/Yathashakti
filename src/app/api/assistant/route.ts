import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Default response for when we can't reach the LLM API
const fallbackResponses = [
  "Based on your nonprofit's current status, I recommend focusing on creating your first grant entry.",
  "You might want to visit the 'Grants' section to add your first grant data.",
  "I notice you have grants but no programs. Creating programs will help you organize your grants more effectively.",
  "The Analytics Dashboard will show more meaningful data once you've added some grants and programs.",
  "Have you considered setting up your first service provider record? This would help track external partnerships.",
];

// Function to create a prompt with context
function createPromptWithContext(
  message: string,
  history: Array<{ role: string; content: string }>,
  context: any
) {
  // Format chat history
  const formattedHistory = history
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');
  
  // Build context description
  let contextDescription = 'Context:\n';
  
  if (context.isEmpty) {
    contextDescription += '- The database is empty with no records\n';
  }
  
  if (context.currentPage) {
    contextDescription += `- User is currently on the ${context.currentPage} page\n`;
  }
  
  if (context.totalGrants !== undefined) {
    contextDescription += `- There are ${context.totalGrants} grants in the system\n`;
  }
  
  if (context.totalPrograms !== undefined) {
    contextDescription += `- There are ${context.totalPrograms} programs in the system\n`;
  }
  
  // Construct the full prompt
  return `You are an AI assistant for Yathashakti, a nonprofit grant management platform. 
Your role is to help users navigate the platform and suggest next best actions.

${contextDescription}

Previous conversation:
${formattedHistory}

User: ${message}

Assistant:`;
}

// In development mode, we'll use a simulated response
function getSimulatedResponse(message: string, context: any): string {
  // Check for keywords to generate more relevant responses
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('grant') || lowerMessage.includes('create')) {
    return "To create a new grant, navigate to the Grants section in the sidebar and click on the '+ Create Grant' button. You'll need to fill in details like the grant amount, duration, and recipient information.";
  }
  
  if (lowerMessage.includes('program') || lowerMessage.includes('initiative')) {
    return "Programs help you organize related grants under a common initiative. To create a program, go to the Programs section and click '+ New Program'. You can then associate grants with this program.";
  }
  
  if (lowerMessage.includes('dashboard') || lowerMessage.includes('analytics') || lowerMessage.includes('report')) {
    return "The Analytics Dashboard provides an overview of your grants and programs. As you add more data, you'll see meaningful insights and trends. You can access it from the 'Analytics Dashboard' link in the sidebar.";
  }
  
  if (lowerMessage.includes('empty') || lowerMessage.includes('no data')) {
    return "It looks like your database doesn't have much data yet. Start by creating a grant through the Grants section. Once you've added some grants, you can organize them into programs and see analytics on your dashboard.";
  }
  
  // Default to a random fallback response if no keywords match
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

// Main API handler
export async function POST(request: NextRequest) {
  try {
    // Parse request body first
    const body = await request.json();
    const { message, history = [], context = {} } = body;
    
    // Skip authentication in development mode
    if (process.env.NODE_ENV !== 'production') {
      // Development mode - continue without auth check
      console.log('Development mode: Skipping authentication check for assistant API');
    } else {
      // Production mode - ensure user is authenticated
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Create prompt with context
    const prompt = createPromptWithContext(message, history, context);

    // In production, this is where you'd call the Hugging Face API
    // For now, we'll use a simulated response in development
    // and set up the API integration when ready
    let result;

    if (process.env.NODE_ENV === 'production' && process.env.HUGGINGFACE_API_KEY) {
      try {
        // Call Hugging Face API
        const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 250,
              temperature: 0.7,
              top_p: 0.9,
              do_sample: true,
            }
          }),
        });

        if (!response.ok) {
          throw new Error(`Hugging Face API error: ${response.statusText}`);
        }

        const data = await response.json();
        result = data[0]?.generated_text || 'I couldn\'t generate a helpful response. Please try again.';
        
        // Extract just the assistant's response
        // Using a regex that works without the 's' flag (which requires ES2018+)
        const assistantPrefix = 'Assistant:';
        if (result.includes(assistantPrefix)) {
          const startIndex = result.indexOf(assistantPrefix) + assistantPrefix.length;
          const endIndex = result.indexOf('User:', startIndex);
          const assistantResponse = endIndex > startIndex 
            ? result.substring(startIndex, endIndex) 
            : result.substring(startIndex);
          result = assistantResponse.trim();
        }
      } catch (error) {
        console.error('Error calling Hugging Face API:', error);
        result = getSimulatedResponse(message, context);
      }
    } else {
      // Use simulated response in development
      result = getSimulatedResponse(message, context);
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Assistant API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
