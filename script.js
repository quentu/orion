document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const userInput = document.getElementById('user-input');
    const messageText = userInput.value.trim();

    if (messageText === '') return;

    displayMessage(messageText, 'user-message');
    userInput.value = '';

    // Send the message to the local AI and get the response
    getAIResponse(messageText).then(aiResponse => {
        displayMessage(aiResponse, 'ai-message');
    }).catch(error => {
        console.error('Error:', error);
        displayMessage('Sorry, something went wrong.', 'ai-message');
    });
}

function displayMessage(text, className) {
    const messageElement = document.createElement('div');
    messageElement.textContent = text;
    messageElement.className = `message ${className}`;
    document.getElementById('messages').appendChild(messageElement);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}

async function getAIResponse(userMessage) {
    // Example AJAX call to a local server interacting with Ollama Llama 3
    const response = await fetch('/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
    });


    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.response; // Adjust this based on your server's response structure
}