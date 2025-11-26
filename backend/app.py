from flask import Flask, request, jsonify, send_file
from dotenv import load_dotenv
import google.generativeai as genai
import os
import io
import speech_recognition as sr
from gtts import gTTS
from pydub import AudioSegment

load_dotenv()

app = Flask(__name__)

# Configure the generative AI model
genai.configure(api_key=os.getenv("API_KEY"))
model = genai.GenerativeModel('gemini-pro')

@app.route("/api/chat", methods=["POST"])
def chat():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']

    # Convert webm to wav
    audio = AudioSegment.from_file(audio_file, format="webm")
    wav_io = io.BytesIO()
    audio.export(wav_io, format="wav")
    wav_io.seek(0)

    # Speech-to-text
    r = sr.Recognizer()
    with sr.AudioFile(wav_io) as source:
        audio_data = r.record(source)
    try:
        text = r.recognize_google(audio_data)
    except sr.UnknownValueError:
        return jsonify({"error": "Could not understand audio"}), 400

    # Send text to Gemini API
    response = model.generate_content(text)

    # Text-to-speech
    tts = gTTS(text=response.text, lang='en')
    mp3_io = io.BytesIO()
    tts.write_to_fp(mp3_io)
    mp3_io.seek(0)

    return send_file(mp3_io, mimetype='audio/mpeg')

if __name__ == "__main__":
    app.run(debug=True)
