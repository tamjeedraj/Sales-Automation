
import os
import re
from dotenv import load_dotenv
import google.generativeai as genai

# .env file se variables load karna
load_dotenv()

# Gemini API ko configure karna safely
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("⚠️ Warning: .env file mein GEMINI_API_KEY nahi mili!")
else:
    genai.configure(api_key=GEMINI_API_KEY)

def get_instagram_via_gemini(vendor_name, city):
    """
    Gemini AI Engine: Direct dynamic search & validation for Instagram handles
    """
    # Agar API key missing hai toh sidhe search fallback par bhej dein
    if not os.getenv("GEMINI_API_KEY"):
        return f"https://instagram.com/search?q={vendor_name.replace(' ', '+')}"

    prompt = (
        f"Find the official Instagram profile URL for the wedding vendor named '{vendor_name}' "
        f"located in '{city}', India. Return ONLY the absolute URL (starting with https://) "
        f"and absolutely nothing else. No explanation, no markdown backticks."
    )
    
    try:
        # 2026 Recommended Fast Production Model
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        response = model.generate_content(prompt)
        url = response.text.strip()
        
        # Safe check logic: clean markdown if AI returns backticks
        url = url.replace("`", "").replace("html", "").strip()
        
        if "instagram.com" in url:
            return url
        else:
            return f"https://instagram.com/search?q={vendor_name.replace(' ', '+')}"
            
    except Exception as e:
        print(f"🤖 AI Error: {e}")
        # System fallback link agar API hit limits ho jaye ya error aaye
        return f"https://instagram.com/search?q={vendor_name.replace(' ', '+')}"

# --- DEMO TESTING ZONE ---
if __name__ == "__main__":
    # Test karne ke liye script ko direct run karke dekh sakte hain
    print("Testing Gemini AI Link Finder...")
    test_url = get_instagram_via_gemini("Shaandaar Events", "Delhi")
    print(f"🎯 Result URL: {test_url}")