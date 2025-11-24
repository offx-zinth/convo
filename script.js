// WARNING: This is a placeholder API key. It will not work.
// You must replace it with your own Google Gemini API key.
// IMPORTANT: Storing API keys directly in client-side code is a security risk.
// In a production environment, this should be handled by a backend server.
const API_KEY = "AIzaSyCPGNbIy7veCz7itQC3SeATBGPFBXEc55o";

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const userMessage = userInput.value;
    if (userMessage.trim() === '') return;

    appendMessage('user', userMessage);
    userInput.value = '';

    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "contents": [{
                "parts": [{
                    "text": userMessage
                }]
            }]
        })
    })
    .then(response => response.json())
    .then(data => {
        const aiMessage = data.candidates[0].content.parts[0].text;
        appendMessage('ai', aiMessage);
        speak(aiMessage);
    })
    .catch(error => {
        console.error('Error:', error);
        appendMessage('ai', 'Sorry, something went wrong.');
    });
}

function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.innerText = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
}
