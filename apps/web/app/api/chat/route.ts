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

function getFallbackResponse(query: string, contextData: any): string {
  const q = query.toLowerCase();
  
  let ldl = "110 mg/dL (target < 100)";
  let crp = "2.1 mg/L (target < 1.0)";
  let glucose = "95 mg/dL";

  if (contextData?.biomarkerData) {
    const ldlObj = contextData.biomarkerData.find((b: any) => b.name?.includes("LDL"));
    if (ldlObj) ldl = `${ldlObj.value} ${ldlObj.unit} (target: ${ldlObj.target})`;
    const crpObj = contextData.biomarkerData.find((b: any) => b.name?.includes("CRP"));
    if (crpObj) crp = `${crpObj.value} ${crpObj.unit} (target: ${crpObj.target})`;
    const gluObj = contextData.biomarkerData.find((b: any) => b.name?.includes("Glucose"));
    if (gluObj) glucose = `${gluObj.value} ${gluObj.unit}`;
  }

  if (q.includes("risk") || q.includes("biggest") || q.includes("explain")) {
    return `Based on your BioTwin digital twin telemetry, your primary elevated indicators are:
1. **LDL Cholesterol**: Current level is ${ldl}. This represents a mild elevation that can contribute to cardiovascular risk over time.
2. **CRP (Inflammation)**: Current level is ${crp}. Elevated CRP indicates low-grade systemic inflammation, which is often linked with cardiovascular and lifestyle stressors.

Your blood glucose (${glucose}) and HbA1c levels are currently optimal, showing excellent metabolic health. 

I recommend exploring the **Cardiovascular** and **Liver** organs on your 3D Digital Twin model to visualize where these markers interact. What specific aspect of these risks would you like to address first?`;
  }

  if (q.includes("cardiovascular") || q.includes("heart") || q.includes("reduce")) {
    return `To reduce your cardiovascular risk, we want to address your elevated LDL Cholesterol (${ldl}) and CRP (${crp}):
- **Aerobic Exercise**: Aim for 150 minutes of moderate-intensity activity per week. This helps raise HDL and lower LDL.
- **Dietary Adjustments**: Increase soluble fiber (oats, legumes) and focus on healthy fats (extra virgin olive oil, avocados, nuts) while minimizing saturated fats.
- **Stress Management & Sleep**: Poor sleep and chronic stress elevate CRP. Aim for 7-8 hours of quality sleep daily.

You can look at the **Heart** and **Arteries** in the 3D Digital Twin viewer to see how cholesterol deposition is simulated. Would you like some specific dietary suggestions or an exercise plan?`;
  }

  if (q.includes("lifestyle") || q.includes("change") || q.includes("help most")) {
    return `Based on your recent activity patterns, here are the lifestyle changes that will yield the highest impact:
1. **Targeting LDL Cholesterol**: Focus on dietary fiber and reducing saturated fats. Even small shifts can help bring your LDL from ${ldl} down to the target.
2. **Targeting CRP (Inflammation)**: Focus on anti-inflammatory lifestyle habits: daily movement, omega-3 fatty acids, and stress-reduction practices like mindfulness or yoga.
3. **Consistent Sleep**: Ensure you're maintaining a regular sleep schedule to aid tissue recovery and support immune function.

Check out the **Musculoskeletal** and **Nervous system** views in your 3D Digital Twin to see how physical activity impacts system-wide health. Shall we set a goal for steps or sleep this week?`;
  }

  // Default response
  return `I'm here as your BioTwin AI Health Coach! I've analyzed your telemetry data. Your metabolic markers (Blood Glucose: ${glucose}) are in the optimal range. However, we should keep an eye on your LDL Cholesterol (${ldl}) and CRP (${crp}), which are slightly elevated.

To see how these biomarkers affect your physiological systems, try clicking on the **Heart**, **Liver**, or **Circulatory System** in your 3D Digital Twin dashboard. 

What would you like to discuss today? I can help you with diet, exercise tips, or explaining your risk assessments.`;
}

function streamText(text: string): Response {
  const encoder = new TextEncoder();
  const words = text.split(" ");
  
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < words.length; i++) {
        const word = words[i] + (i === words.length - 1 ? "" : " ");
        const data = {
          choices: [
            {
              delta: {
                content: word
              }
            }
          ]
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        // Add a tiny delay to simulate streaming
        await new Promise(r => setTimeout(r, 20));
      }
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}

export async function POST(req: Request) {
  let messages: any[] = [];
  let contextData: any = null;
  
  try {
    const body = await req.json();
    messages = body.messages || [];
    contextData = body.contextData;
  } catch (e) {
    // Leave them empty
  }

  const userQuery = messages.length > 0 ? messages[messages.length - 1]?.content || "" : "";
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    console.warn("GROQ_API_KEY is not configured. Falling back to simulated response.");
    return streamText(getFallbackResponse(userQuery, contextData));
  }

  try {
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
      console.error(`Groq API Error: ${response.status} ${errorText}. Falling back to simulated response.`);
      return streamText(getFallbackResponse(userQuery, contextData));
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
    console.error(`Error in chat route: ${err.message}. Falling back to simulated response.`);
    return streamText(getFallbackResponse(userQuery, contextData));
  }
}
