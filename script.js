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

    
    const typingBubble = createTypingBubble();
    document.getElementById('messages').appendChild(typingBubble);
    forceScrollToBottom();

    
    getAIResponse(messageText).then(aiResponse => {
        typingBubble.remove(); 
        displayMessage(aiResponse, 'ai-message');
    }).catch(error => {
        console.error('Error:', error);
        typingBubble.remove();
        displayMessage('Sorry, something went wrong.', 'ai-message');
    });
}


function displayMessage(text, className) {
    const messageElement = document.createElement('div');
    messageElement.textContent = text;
    messageElement.className = `message ${className}`;
    document.getElementById('messages').appendChild(messageElement);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
    forceScrollToBottom();
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

const textOptions = [
    "What's on your mind?",
    "Ready whenever you are.",
    "You better not be vibe-coding.",
    "Plotting something big?",
    "How can I help today?"
];


function getRandomText(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length); // choose random array index
    return arr[randomIndex];
}

function displayRandomText() {
    const displayElement = document.getElementById("greeting");
    const newText = getRandomText(textOptions);
    displayElement.textContent = newText;
}

displayRandomText();

// --- FORCE CHAT TO STAY AT BOTTOM LIKE REAL CHAT APPS ---

const userInputBox = document.getElementById('user-input');
const messagesDiv = document.getElementById('messages');

function forceScrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// When you click into the input
userInputBox.addEventListener('focus', forceScrollToBottom);

// When you start typing
userInputBox.addEventListener('input', forceScrollToBottom);

function createTypingBubble() {
  const bubble = document.createElement("div");
  bubble.className = "message assistant typing";
  bubble.innerHTML = `
    <div class="dots">
      <span></span><span></span><span></span>
    </div>
  `;
  return bubble;
}
