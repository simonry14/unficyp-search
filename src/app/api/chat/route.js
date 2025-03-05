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

    // Call OpenAI API with streaming enabled
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",  //model: "deepseek-chat",
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant for UNFICYP (United Nations Peacekeeping Force in Cyprus). Provide helpful, contextually relevant, and professional responses related to UN peacekeeping, Cyprus, and international diplomatic efforts.'
        },
        ...conversationHistory
      ],
      max_tokens: 400,
      temperature: 0.7,
      stream: true // Enable streaming
    });

    // Set response headers for streaming
    const encoder = new TextEncoder();
    const streamResponse = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      }
    });

    return new NextResponse(streamResponse, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json({
      error: 'Failed to generate response'
    }, { status: 500 });
  }
}
