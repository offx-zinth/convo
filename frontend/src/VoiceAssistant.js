import React, { useState, useRef } from 'react';

const VoiceAssistant = () => {
  const [recording, setRecording] = useState(false);
  const [responseAudioURL, setResponseAudioURL] = useState('');
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        audioChunks.current = [];
        // Send the audio to the backend
        sendAudioToBackend(audioBlob);
      };

      mediaRecorder.current.start();
      setRecording(true);
      setResponseAudioURL(''); // Clear previous response
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const handleStopRecording = () => {
    mediaRecorder.current.stop();
    setRecording(false);
  };

  const sendAudioToBackend = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const audioBlobResponse = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlobResponse);
      setResponseAudioURL(audioUrl);
      const audio = new Audio(audioUrl);
      audio.play();

    } catch (error) {
      console.error("Error sending audio to backend:", error);
    }
  };

  return (
    <div>
      <h1>AI Voice Assistant</h1>
      <button onClick={recording ? handleStopRecording : handleStartRecording}>
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {responseAudioURL && <audio src={responseAudioURL} controls autoPlay />}
    </div>
  );
};

export default VoiceAssistant;
