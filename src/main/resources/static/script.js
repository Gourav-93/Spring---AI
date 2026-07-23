document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatContainer = document.getElementById('chatContainer');
    const messagesWrapper = document.getElementById('messagesWrapper');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const clearChatBtn = document.getElementById('clearChatBtn');
    
    // Sidebar Elements (Mobile)
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const menuBtn = document.getElementById('menuBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    
    // New Chat Buttons
    const newChatBtnSidebar = document.getElementById('newChatBtnSidebar');

    // API Configuration
    const API_URL = "http://localhost:8080/api/gemini";
    let isGenerating = false;

    // ==========================================
    // UI Interactions & Event Listeners
    // ==========================================

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        
        // Enable/disable send button based on input
        if (this.value.trim() !== '' && !isGenerating) {
            sendBtn.removeAttribute('disabled');
        } else {
            sendBtn.setAttribute('disabled', 'true');
        }
    });

    // Handle Enter key for sending
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (messageInput.value.trim() !== '' && !isGenerating) {
                sendMessage();
            }
        }
    });

    // Handle Send Button click
    sendBtn.addEventListener('click', () => {
        if (messageInput.value.trim() !== '' && !isGenerating) {
            sendMessage();
        }
    });

    // Clear Chat
    clearChatBtn.addEventListener('click', clearChat);
    newChatBtnSidebar.addEventListener('click', () => {
        clearChat();
        if (window.innerWidth <= 768) {
            closeSidebar();
        }
    });

    // Mobile Sidebar Toggle
    menuBtn.addEventListener('click', openSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    // Make insertSuggestion globally available for inline onclick
    window.insertSuggestion = function(text) {
        messageInput.value = text;
        // Trigger input event to resize textarea and enable button
        messageInput.dispatchEvent(new Event('input'));
        messageInput.focus();
    };

    // ==========================================
    // Core Functions
    // ==========================================

    async function sendMessage() {
        const promptText = messageInput.value.trim();
        if (!promptText || isGenerating) return;

        // Reset input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        sendBtn.setAttribute('disabled', 'true');

        // Hide welcome screen if visible
        if (welcomeScreen.style.display !== 'none') {
            welcomeScreen.style.display = 'none';
        }

        // Add user message to UI
        addMessageToUI(promptText, 'user');
        
        // Disable interactions during generation
        isGenerating = true;
        
        // Show loading indicator
        const typingIndicatorId = addTypingIndicator();

        try {
            // Call Backend API
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question: promptText })
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status} ${response.statusText}`);
            }

            let aiResponseText = await response.text();
            
            try {
                let cleanText = aiResponseText.trim();
                if (cleanText.startsWith("```json")) {
                    cleanText = cleanText.substring(7);
                }
                if (cleanText.endsWith("```")) {
                    cleanText = cleanText.substring(0, cleanText.length - 3);
                }
                cleanText = cleanText.trim();
                
                const jsonObj = JSON.parse(cleanText);
                if (jsonObj && jsonObj.response) {
                    aiResponseText = jsonObj.response;
                }
            } catch (e) {
                // Fallback to raw text if parsing fails
            }
            
            // Remove typing indicator
            removeTypingIndicator(typingIndicatorId);
            
            // Add AI response to UI
            addMessageToUI(aiResponseText, 'ai');

        } catch (error) {
            console.error('Error fetching AI response:', error);
            // Remove typing indicator
            removeTypingIndicator(typingIndicatorId);
            // Show error message
            addMessageToUI(`Sorry, I couldn't connect to the backend. Please ensure the Spring Boot server is running on localhost:8080. Details: ${error.message}`, 'error');
        } finally {
            isGenerating = false;
            // Re-enable send button if there's text
            if (messageInput.value.trim() !== '') {
                sendBtn.removeAttribute('disabled');
            }
            messageInput.focus();
        }
    }

    function addMessageToUI(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        // Use standard error styling for errors but ai layout
        if (sender === 'error') {
            messageDiv.className = 'message ai error';
            sender = 'ai'; // For avatar rendering
        }

        // Create avatar based on sender
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        
        if (sender === 'user') {
            avatarDiv.innerHTML = '<i class="ph ph-user"></i>';
        } else {
            avatarDiv.innerHTML = '<i class="ph ph-sparkle-fill"></i>';
        }

        // Create message content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Format text (simple line breaks to paragraphs)
        // Note: For a real app, a Markdown parser like marked.js is recommended
        const formattedText = text.split('\n').map(line => {
            if (line.trim() === '') return '<br>';
            return `<p>${escapeHTML(line)}</p>`;
        }).join('');
        
        contentDiv.innerHTML = formattedText;

        // Append to message div
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        // Append to wrapper
        messagesWrapper.appendChild(messageDiv);
        
        // Scroll to bottom
        scrollToBottom();
    }

    function addTypingIndicator() {
        const id = 'typing-' + Date.now();
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai typing-message';
        messageDiv.id = id;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        avatarDiv.innerHTML = '<i class="ph ph-sparkle-fill"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        contentDiv.appendChild(typingIndicator);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        messagesWrapper.appendChild(messageDiv);
        scrollToBottom();
        
        return id;
    }

    function removeTypingIndicator(id) {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    }

    function clearChat() {
        messagesWrapper.innerHTML = '';
        welcomeScreen.style.display = 'flex';
        messageInput.value = '';
        messageInput.style.height = 'auto';
        sendBtn.setAttribute('disabled', 'true');
        isGenerating = false;
    }

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Sidebar Utilities
    function openSidebar() {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    }

    // Utility: Escape HTML to prevent XSS
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
