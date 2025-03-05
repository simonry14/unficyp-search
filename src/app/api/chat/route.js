import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

//const openai = new OpenAI({
 // baseURL: 'https://api.deepseek.com',
 // apiKey: process.env.DEEPSEEK_API_KEY
//});

export async function POST(req) {
  try {
    // Parse the incoming request
    const { message, context } = await req.json();

    // Construct conversation history for context
    const conversationHistory = context ? context.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text
    })) : [];

    // Add current message
    conversationHistory.push({
      role: 'user',
      content: message
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",  //model: "deepseek-chat",
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant for UNFICYP (United Nations Peacekeeping Force in Cyprus). Provide helpful, contextually relevant, and professional responses related to UN peacekeeping, Cyprus, and international diplomatic efforts.'
        },
        ...conversationHistory
      ],
      max_tokens: 400,
      temperature: 0.7
    });

    // Extract the response
    const aiResponse = completion.choices[0].message.content.trim();

    // Return the response
    return NextResponse.json({ 
      response: aiResponse 
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate response' 
    }, { status: 500 });
  }
}