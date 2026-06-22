import asyncio
import os
import sys
from dotenv import load_dotenv

# Add app to path to load settings
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load env file
load_dotenv()

from app.core.config import settings
import google.generativeai as genai


async def main():
    print("Testing Gemini API Integration...")
    print(f"Loaded GEMINI_API_KEY: {settings.GEMINI_API_KEY[:6]}...{settings.GEMINI_API_KEY[-6:] if len(settings.GEMINI_API_KEY) > 12 else ''}")

    if not settings.GEMINI_API_KEY:
        print("ERROR: GEMINI_API_KEY is not set in config/env!")
        return

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        models_to_try = [
            "gemini-2.0-flash-lite",
            "gemini-2.0-flash",
            "gemini-3.1-flash-lite",
            "gemini-2.5-flash-lite"
        ]
        
        for model_name in models_to_try:
            print(f"\nTrying model: {model_name}...")
            try:
                model = genai.GenerativeModel(model_name)
                response = await model.generate_content_async(
                    "Say 'OK'",
                    generation_config=genai.types.GenerationConfig(
                        max_output_tokens=5
                    )
                )
                print(f"SUCCESS with {model_name}: {response.text.strip()}")
            except Exception as inner_e:
                print(f"FAILED with {model_name}: {str(inner_e)}")
                
    except Exception as e:
        print(f"\nERROR: Failed to run test: {str(e)}")


if __name__ == "__main__":
    asyncio.run(main())
