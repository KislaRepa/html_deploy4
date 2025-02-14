let threadId = null;
let isLocked = false;

async function startThread() {
    try {
        const response = await fetch('https://nova-gorica-deploy.onrender.com/start');
        const data = await response.json();
        threadId = data.thread_id;
    } catch (error) {
        console.error('Error starting thread:', error);
    }
}

async function sendMessage() {
    if (isLocked) return;

    const userInputElement = document.getElementById('user-input');
    const userInput = userInputElement.value.trim(); // Trim leading and trailing whitespace

    if (!userInput) return; // If input is empty after trimming, do nothing

    lockInputs();

    addMessageToChatLog('user', userInput);
    userInputElement.value = '';

    if (!threadId) await startThread();

    try {
        const response = await fetch('https://nova-gorica-deploy.onrender.com/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                thread_id: threadId,
                message: userInput
            })
        });
        const data = await response.json();
        addMessageToChatLog('bot', data.response);
    } catch (error) {
        console.error('Error sending message:', error);
    } finally {
        unlockInputs();
    }
    return Promise.resolve();
}

// Function to lock both FAQ questions and user input
function lockInputs() {
    isLocked = true;

    // Disable all FAQ list items
    const faqItems = document.querySelectorAll('.faq-list li');
    faqItems.forEach(item => item.style.pointerEvents = 'none');

    // Disable the input and button
    const userInputElement = document.getElementById('user-input');
    const sendButton = document.querySelector('.chat-input button');
    userInputElement.disabled = true;
    sendButton.disabled = true;
}

// Function to unlock both FAQ questions and user input
function unlockInputs() {
    isLocked = false;

    // Re-enable all FAQ list items
    const faqItems = document.querySelectorAll('.faq-list li');
    faqItems.forEach(item => item.style.pointerEvents = 'auto');

    // Re-enable the input and button
    const userInputElement = document.getElementById('user-input');
    const sendButton = document.querySelector('.chat-input button');
    userInputElement.disabled = false;
    sendButton.disabled = false;
}

function handleKeyDown(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Function to send FAQ question to chatbot as user input
function sendFAQToChatbot(question) {
    if (isLocked) return; // Prevent sending multiple requests

    const userInputElement = document.getElementById('user-input');
    userInputElement.value = question;
    sendMessage();
    openChatbot();
}

function addMessageToChatLog(sender, message) {
    const chatLog = document.getElementById('chat-log');
    const messageElement = document.createElement('p');
    messageElement.className = sender;
    // Da se znebiš anotacij/citatov!
    const cleanedMessage = message.replace(/【.*?】/g, '');

    messageElement.textContent = cleanedMessage;
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function openChatbot() {
    const chatLog = document.getElementById('chat-log');
    const chatbotPopup = document.getElementById('chatbot-popup');
    chatbotPopup.style.display = 'block';

    // Add the "show" class for animation
    setTimeout(() => {
        chatbotPopup.classList.add('show');
    }, 10);

    // Check if the greeting is already present to avoid duplication
    if (!document.getElementById('greeting-message')) {
        const greetingElement = document.createElement('p');
        greetingElement.className = 'bot';
        greetingElement.id = 'greeting-message';
        greetingElement.textContent = 'Pozdravljeni! Kako vam lahko pomagam?';
        chatLog.appendChild(greetingElement);
        chatLog.scrollTop = chatLog.scrollHeight;
    }
}

function closeChatbot() {
    const chatbotPopup = document.getElementById('chatbot-popup');
    chatbotPopup.classList.remove('show');

    // Delay hiding the popup to allow the animation to complete
    setTimeout(() => {
        chatbotPopup.style.display = 'none';
    }, 300);
}

// Function to automatically open the chatbot on page load
function openChatbotOnLoad() {
    openChatbot();
}

// Start a new thread when the page loads
startThread();

// Open the chatbot automatically when the page loads
window.onload = openChatbotOnLoad;
