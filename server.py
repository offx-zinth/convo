from fastapi import FastAPI
from fastapi.responses import FileResponse, HTMLResponse
import google.generativeai as genai
from gtts import gTTS
import uuid, os, json
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class RequestBody(BaseModel):
    text: str

app = FastAPI()

# Replace with your API key
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

@app.post("/api/ai")
async def ai_reply(data: RequestBody):
    user_text = data.text

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = f"Reply conversationally to: \"{user_text}\". Also output one emotion (happy, sad, angry, neutral) in JSON format like {{\"emotion\":\"happy\"}}"
        response = model.generate_content(prompt)

        text = response.text

        start = text.find('{')
        end = text.rfind('}') + 1
        if start != -1 and end != 0:
            json_part = text[start:end]
            ai_text = text[:start].strip()
            emotion_data = json.loads(json_part)
            emotion = emotion_data.get("emotion", "neutral")
        else:
            ai_text = text
            emotion = "neutral"

        filename = f"audio_{uuid.uuid4()}.mp3"
        filepath = os.path.join("app", "static", filename)
        tts = gTTS(text=ai_text, lang="en")
        tts.save(filepath)

        return {
            "reply": ai_text,
            "emotion": emotion,
            "audioUrl": f"/static/{filename}"
        }
    except Exception as e:
        return {"error": str(e)}, 500

app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.mount("/", StaticFiles(directory="app", html=True), name="app")
