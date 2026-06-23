"""AI Health Coach service"""
import google.generativeai as genai
from typing import List, AsyncGenerator
from app.core.config import settings

# Safety keywords that require immediate professional referral
URGENT_KEYWORDS = [
    "chest pain", "heart attack", "stroke", "severe bleeding",
    "difficulty breathing", "can't breathe", "suicidal", "overdose"
]

# Disclaimer for the coach
COACH_DISCLAIMER = (
    "BioTwin AI provides wellness risk estimates based on the data you provide. "
    "It is not a diagnostic tool and does not replace professional medical evaluation. "
    "Always consult a licensed healthcare provider for diagnosis, treatment, or any urgent symptoms."
)


class HealthCoach:
    """LLM-powered health coach with RAG grounding using Gemini"""

    def __init__(self):
        self.enabled = bool(settings.GEMINI_API_KEY or settings.GROQ_API_KEY)
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)

    async def stream_response(
        self,
        user_message: str,
        conversation_history: List,
        user_context: dict
    ) -> AsyncGenerator[str, None]:
        """Stream AI coach response"""

        # Check for urgent keywords
        if self._check_urgent(user_message):
            yield "I understand you're describing symptoms that require immediate attention. "
            yield "Please contact emergency services or seek urgent medical care right away. "
            yield "For non-emergency guidance, please consult with a healthcare provider. "
            yield "\n\n"
            yield COACH_DISCLAIMER
            return

        # Build context
        system_prompt = self._build_system_prompt(user_context)
        messages = self._build_messages(user_message, conversation_history)

        if not self.enabled:
            # Fallback response if no API key
            yield "AI Health Coach is not configured. Please set GEMINI_API_KEY."
            return

        try:
            model = genai.GenerativeModel(
                model_name="gemini-2.5-flash",
                system_instruction=system_prompt
            )
            response = await model.generate_content_async(
                messages,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=1024,
                ),
                stream=True
            )
            async for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            # Fallback to Groq if Gemini fails
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Gemini API failed: {str(e)}. Falling back to Groq...")
            
            if not settings.GROQ_API_KEY:
                yield f"Gemini API failed and no Groq fallback key is configured. Error: {str(e)}"
                return

            try:
                import httpx
                import json
                
                # Map messages to OpenAI format (Groq spec)
                groq_messages = [{"role": "system", "content": system_prompt}]
                for msg in conversation_history[-10:]:
                    role = getattr(msg, "role", None) or (msg.get("role") if isinstance(msg, dict) else "user")
                    # Map assistant role correctly
                    if role == "assistant" or role == "model":
                        role = "assistant"
                    content = getattr(msg, "content", None) or (msg.get("content") if isinstance(msg, dict) else "")
                    groq_messages.append({
                        "role": role,
                        "content": content
                    })
                
                groq_messages.append({
                    "role": "user",
                    "content": user_message
                })

                headers = {
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "model": "llama-3.1-8b-instant",
                    "messages": groq_messages,
                    "temperature": 0.7,
                    "max_tokens": 1024,
                    "stream": True
                }

                async with httpx.AsyncClient(timeout=30.0) as client:
                    async with client.stream(
                        "POST", 
                        "https://api.groq.com/openai/v1/chat/completions", 
                        headers=headers, 
                        json=payload
                    ) as response:
                        if response.status_code != 200:
                            err_body = await response.aread()
                            yield f"I apologize, but both Gemini and fallback Groq systems encountered errors. (Groq status: {response.status_code})"
                            logger.error(f"Groq API error response: {err_body.decode('utf-8', errors='ignore')}")
                            return
                        
                        # Process response stream
                        async for line in response.aiter_lines():
                            line = line.strip()
                            if line.startswith("data: "):
                                data_str = line[6:]
                                if data_str == "[DONE]":
                                    break
                                try:
                                    data_json = json.loads(data_str)
                                    content_chunk = data_json["choices"][0]["delta"].get("content", "")
                                    if content_chunk:
                                        yield content_chunk
                                except Exception:
                                    pass
            except Exception as fallback_error:
                yield f"I apologize, but both primary and secondary AI systems failed. (Primary error: {str(e)}, Secondary error: {str(fallback_error)})"

    def _check_urgent(self, message: str) -> bool:
        """Check if message contains urgent keywords"""
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in URGENT_KEYWORDS)

    def _build_system_prompt(self, user_context: dict) -> str:
        """Build system prompt with user context"""

        risk_info = ""
        if user_context.get("risk_assessments"):
            risk_info = "## Current Risk Profile:\n"
            for r in user_context["risk_assessments"]:
                risk_info += f"- {r['disease'].upper()}: {r['score']:.0%} risk ({r['band']})\n"

        rec_info = ""
        if user_context.get("recommendations"):
            rec_info = "## Active Recommendations:\n"
            for r in user_context["recommendations"]:
                rec_info += f"- {r}\n"

        return f"""You are the BioTwin AI Health Coach, a supportive wellness assistant.

{COACH_DISCLAIMER}

Your role:
- You operate alongside an interactive 3D Digital Twin of the user's body.
- When explaining health risks or factors, explicitly reference the affected organs and encourage the user to explore them in the 3D model.
- Explain health risk scores in plain, understandable language
- Discuss lifestyle factors that contribute to disease risk
- Provide evidence-based wellness recommendations
- NEVER diagnose - always frame as risk/probability
- IMMEDIATELY redirect to professional care for any urgent symptoms mentioned
- NEVER provide medication dosing or prescription advice

{risk_info}

{rec_info}

Guidelines:
- Ground your responses in the user's actual data (blood markers, lifestyle, risk scores)
- Cite specific data points when explaining risk factors
- Be empathetic and encouraging - focus on achievable improvements
- Use simple language, avoid medical jargon
- If uncertain about something, recommend consulting a healthcare provider"""

    def _build_messages(self, user_message: str, history: List) -> List[dict]:
        """Build message list for Gemini API"""

        messages = []

        # Add history (last 10 messages)
        for msg in history[-10:]:
            role = "model" if msg.role == "assistant" else "user"
            messages.append({
                "role": role,
                "parts": [msg.content]
            })

        # Add current message
        messages.append({
            "role": "user",
            "parts": [user_message]
        })

        return messages