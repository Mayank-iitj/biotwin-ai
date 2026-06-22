import asyncio
import os
import sys
from dotenv import load_dotenv

# Add app to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load env file
load_dotenv()

from app.services.health_coach import HealthCoach

async def test_coach():
    print("Initializing HealthCoach...")
    coach = HealthCoach()
    
    print("Sending message: 'Explain why cardiovascular health is important'")
    print("Streaming response:")
    
    context = {
        "risk_assessments": [
            {"disease": "cvd", "score": 0.12, "band": "low"}
        ],
        "recommendations": [
            "Walk 10,000 steps daily",
            "Reduce saturated fats intake"
        ]
    }
    
    try:
        async for chunk in coach.stream_response(
            user_message="Explain why cardiovascular health is important",
            conversation_history=[],
            user_context=context
        ):
            print(chunk, end="", flush=True)
        print("\n\nSUCCESS: Health Coach stream finished!")
    except Exception as e:
        print(f"\n\nERROR: Health Coach stream failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_coach())
