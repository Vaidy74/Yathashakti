import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { granteeData } = await request.json();
    
    if (!granteeData) {
      return NextResponse.json({ error: "No grantee data provided" }, { status: 400 });
    }

    // Prepare system prompt for grantee assessment
    const systemPrompt = `You are an AI assistant for Yathashakti, a platform for managing interest-free, 
    morally repayable grants for NGOs and Implementing Organizations. You are analyzing a grantee profile to assess 
    their risk level, repayment probability, and recommend an appropriate grant amount and program.
    
    Based on historical data and patterns, provide an assessment with the following components:
    1. Risk score (0-100, where lower is better)
    2. Repayment probability percentage
    3. Recommended grant amount (in ₹)
    4. Recommended program name
    5. 2-3 strengths of the application
    6. 1-2 concerns or areas that need attention
    
    Format your response in a structured way that can be easily parsed.`;

    // Prepare the grantee data as a user message
    const userMessage = `Here is the grantee profile to assess:
    
    Name: ${granteeData.name}
    Sector: ${granteeData.sector}
    Experience: ${granteeData.experience}
    Location: ${granteeData.location}
    Business Plan: ${granteeData.businessPlan}
    Requested Amount: ₹${granteeData.requestedAmount}
    
    Please provide your assessment.`;

    // Call the OpenRouter API with the grantee data
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://yathashakti.org', // replace with your actual domain
        'X-Title': 'Yathashakti Grantee Assessment' // Your application name
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json({ error: "Failed to assess grantee" }, { status: 500 });
    }

    const data = await response.json();
    const assessmentText = data.choices[0]?.message?.content || "Unable to assess grantee";
    
    // In a production environment, you would parse the AI's response into structured data
    // For this demo, we'll return a structured response with the raw AI text
    return NextResponse.json({
      riskScore: 24, // Sample value
      repaymentProbability: 89, // Sample value
      recommendedAmount: 20000, // Sample value
      recommendedProgram: "Rural Entrepreneurship Support", // Sample value
      strengths: [
        "Strong existing business with proven revenue",
        "Good sector performance in the region",
        "Previous successful business experience"
      ],
      concerns: [
        "Requested amount slightly higher than optimal for risk profile",
        "Seasonal business with potential cash flow variations"
      ],
      similarGrantees: [
        { id: "GT023", name: "Example Grantee 1", sector: granteeData.sector, repaymentRate: 100 },
        { id: "GT047", name: "Example Grantee 2", sector: granteeData.sector, repaymentRate: 95 }
      ],
      rawAssessment: assessmentText,
      model: data.model || "mistralai/mistral-7b-instruct"
    });
    
  } catch (error) {
    console.error("Error in grantee assessment API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
