const DEV_MODE = false;
const temp = document.getElementById("greeting");
function renderMarkdown(el, markdownText) {
    const html = marked.parse(markdownText, { breaks: true });
    el.innerHTML = DOMPurify.sanitize(html);
}

document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    temp.remove();
    
    // Add chat-active class to main when chat starts
    const mainElement = document.querySelector('main');
    if (!mainElement.classList.contains('chat-active')) {
        mainElement.classList.add('chat-active');
    }
    
    const userInput = document.getElementById('user-input');
    const messageText = userInput.value.trim();
        
    if (messageText === '') return;

    displayMessage(messageText, 'user-message');
    userInput.value = '';

    // show typing bubble immediately
    const typingBubble = createTypingBubble();
    document.getElementById('messages').appendChild(typingBubble);
    forceScrollToBottom();

    // create an assistant bubble to append tokens into
    const aiEl = document.createElement('div');
    aiEl.className = 'message ai-message';

    let started = false;

    try {
        const streamer = DEV_MODE ? fakeStreamAIResponse : streamAIResponse;
        await streamer(messageText, (token) => {
            if (!started) {
                typingBubble.remove();
                document.getElementById('messages').appendChild(aiEl);
                started = true;
            }

            aiEl.dataset.raw = (aiEl.dataset.raw || "") + token;
            renderMarkdown(aiEl, aiEl.dataset.raw);

            forceScrollToBottom();
        });

        // fallback
        if (!started) {
            typingBubble.remove();
            document.getElementById('messages').appendChild(aiEl);
        }
    } catch (error) {
        console.error('Error:', error);
        typingBubble.remove();
        displayMessage('Sorry, something went wrong.', 'ai-message');
    }

}



function displayMessage(text, className) {
    const messageElement = document.createElement('div');
    messageElement.dataset.raw = text;
    renderMarkdown(messageElement, text);
    messageElement.className = `message ${className}`;
    document.getElementById('messages').appendChild(messageElement);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
    forceScrollToBottom();
}

async function fakeStreamAIResponse(userMessage, onToken) {
    const fakeText = await dummyResponse(userMessage);

    // split text into "tokens"
    const tokens = fakeText.split(" ");

    for (let i = 0; i < tokens.length; i++) {
        await new Promise(r => setTimeout(r, 80)); // typing speed
        onToken(tokens[i] + " ");
    }
}

async function streamAIResponse(userMessage, onToken) {
    const response = await fetch('/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (chunk) onToken(chunk);
    }
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

// move input

const userInputBox = document.getElementById('user-input');
const messagesDiv = document.getElementById('messages');

function forceScrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

userInputBox.addEventListener('focus', forceScrollToBottom);

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



function dummyResponse(userMessage) {
    return new Promise((resolve) => {
        const fakeReplies = [
            "This is a dummy response for UI testing.",
            "Brr computer noises",
            "The quick brown fox jumps over the lazy GPU.",
            "Your UI could use some improvment.",
            `Bro said: "${userMessage}", LOL.`,
            "**Bold works** | Here is `inline code` | - List item one | - List item two | ```js function hello(){console.log('Code block works')} ```",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        ];

        const delay = 1200 + Math.random() * 1200;

        setTimeout(() => {
            const reply = fakeReplies[Math.floor(Math.random() * fakeReplies.length)];
            resolve(reply);
        }, delay);
    });
}