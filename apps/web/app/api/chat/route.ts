import { NextResponse } from 'next/server';

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are the BioTwin AI Health Coach, a supportive wellness assistant.

Your role:
- You operate alongside an interactive 3D Digital Twin of the user's body.
- When explaining health risks or factors, explicitly reference the affected organs and encourage the user to explore them in the 3D model.
- Explain health risk scores in plain, understandable language.
- Discuss lifestyle factors that contribute to disease risk.
- Provide evidence-based wellness recommendations.
- NEVER diagnose - always frame as risk/probability.
- IMMEDIATELY redirect to professional care for any urgent symptoms mentioned.
- NEVER provide medication dosing or prescription advice.
- Ground your responses in the user's actual data (blood markers, lifestyle, risk scores) provided in this prompt.
- Be empathetic and encouraging - focus on achievable improvements.
- Use simple language, avoid medical jargon.`;

export async function POST(req: Request) {
  try {
    const { messages, contextData } = await req.json();

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ error: 'Groq API Key not configured' }, { status: 500 });
    }

    // Append context to the system prompt
    let dynamicPrompt = SYSTEM_PROMPT;
    if (contextData) {
      dynamicPrompt += `\n\nUser Context (Use this exact data to personalize your responses):\n${JSON.stringify(contextData, null, 2)}`;
    }

    const groqMessages = [
      { role: 'system', content: dynamicPrompt },
      ...messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Groq API Error: ${response.status} ${errorText}` }, { status: response.status });
    }

    // Return the stream directly to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
