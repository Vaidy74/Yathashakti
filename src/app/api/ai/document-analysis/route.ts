import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // For demo purposes, we'll extract some basic information about the file
    // In a real implementation, you would:
    // 1. Upload the file to a storage service or extract its contents
    // 2. Send the text content to the LLM for analysis
    
    // Extract file information
    const fileInfo = {
      name: file.name,
      type: file.type,
      size: file.size,
    };

    // Prepare system prompt for document analysis
    const systemPrompt = `You are an AI document analyzer for Yathashakti, a platform for managing interest-free, 
    morally repayable grants for NGOs. You are analyzing a document titled "${fileInfo.name}". 
    Extract key information including document type, key insights, entities mentioned (organizations, locations, people), 
    overall sentiment, and provide a brief summary. Also suggest 3-5 recommended actions based on the document content.`;

    // In a real implementation, you'd extract text from the file here
    // For demo purposes, we'll use a mock implementation
    const mockTextContent = `This is a simulated text extraction from the uploaded document "${fileInfo.name}".
    In a production environment, the actual text would be extracted from the file and sent to the LLM.`;

    // Call the OpenRouter API with the document content
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://yathashakti.org', // replace with your actual domain
        'X-Title': 'Yathashakti Document Analysis' // Your application name
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: mockTextContent }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json({ error: "Failed to analyze document" }, { status: 500 });
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content || "Unable to analyze document";
    
    // Parse the AI response into structured data
    // In a real implementation, you'd prompt the AI to return structured JSON
    // For demo, we'll return a structured response
    return NextResponse.json({
      documentType: "Grant Proposal",
      keyInsights: [
        "Key points extracted from the document",
        "Important information identified by AI",
        "Critical data for decision making"
      ],
      entities: {
        organizations: ["Organizations mentioned in document"],
        locations: ["Locations referenced in document"],
        people: ["Key people identified in document"]
      },
      sentiment: {
        score: 0.75,
        label: "Positive"
      },
      summary: "This is an AI-generated summary of the document content based on the analysis.",
      recommendedActions: [
        "Suggested action based on document content",
        "Follow-up tasks recommended by the AI",
        "Key points requiring attention"
      ],
      rawAnalysis: analysisText,
      model: data.model || "mistralai/mistral-7b-instruct"
    });
    
  } catch (error) {
    console.error("Error in document analysis API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
