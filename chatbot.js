/* Modern AI Chatbot Widget for Ramachandra's Portfolio
   Features: Animated typing, suggested questions, modern UI, conversation history */

function ChatbotFactory() {
  const state = {
    open: false,
    sending: false,
    dom: {},
    conversationHistory: [],
    hasGreeted: false,
  };

  // Suggested questions for quick interaction
  const SUGGESTED_QUESTIONS = [
    "What's Ram's experience at Meta?",
    "What technologies does he work with?",
    "Tell me about his projects",
    "How can I contact him?",
    "What's his education background?"
  ];

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else node.setAttribute(k, v);
    }
    for (const c of children) {
      if (typeof c === 'string') {
        node.appendChild(document.createTextNode(c));
      } else {
        node.appendChild(c);
      }
    }
    return node;
  }

  function formatTime() {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function appendMessage(role, text, animate = true) {
    const isUser = role === 'user';
    const messageWrapper = el('div', { class: `chat-message ${role}${animate ? ' animate-in' : ''}` });

    // Avatar
    const avatar = el('div', { class: 'message-avatar' });
    if (isUser) {
      avatar.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
    } else {
      avatar.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';
    }

    // Content wrapper
    const contentWrapper = el('div', { class: 'message-content-wrapper' });

    // Message bubble
    const bubble = el('div', { class: 'message-bubble' });
    bubble.textContent = text;

    // Timestamp
    const time = el('span', { class: 'message-time', text: formatTime() });

    contentWrapper.appendChild(bubble);
    contentWrapper.appendChild(time);

    if (isUser) {
      messageWrapper.appendChild(contentWrapper);
      messageWrapper.appendChild(avatar);
    } else {
      messageWrapper.appendChild(avatar);
      messageWrapper.appendChild(contentWrapper);
    }

    state.dom.messages.appendChild(messageWrapper);
    state.dom.messages.scrollTop = state.dom.messages.scrollHeight;
  }

  function showTypingIndicator() {
    const typingWrapper = el('div', { class: 'chat-message assistant typing-indicator-wrapper', id: 'typing-indicator' });

    const avatar = el('div', { class: 'message-avatar' });
    avatar.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';

    const contentWrapper = el('div', { class: 'message-content-wrapper' });
    const bubble = el('div', { class: 'message-bubble typing-bubble' });
    bubble.innerHTML = `
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;

    contentWrapper.appendChild(bubble);
    typingWrapper.appendChild(avatar);
    typingWrapper.appendChild(contentWrapper);

    state.dom.messages.appendChild(typingWrapper);
    state.dom.messages.scrollTop = state.dom.messages.scrollHeight;
  }

  function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }

  function renderSuggestions() {
    const container = el('div', { class: 'suggestions-container' });
    const label = el('div', { class: 'suggestions-label', text: 'Quick questions:' });
    container.appendChild(label);

    const pills = el('div', { class: 'suggestion-pills' });
    SUGGESTED_QUESTIONS.forEach(q => {
      const pill = el('button', { class: 'suggestion-pill', text: q });
      pill.addEventListener('click', () => {
        state.dom.input.value = q;
        sendMessage(q);
        // Hide suggestions after first use
        container.style.display = 'none';
      });
      pills.appendChild(pill);
    });
    container.appendChild(pills);

    return container;
  }

  async function sendMessage(message) {
    if (state.sending) return;
    const msg = (message || '').trim();
    if (!msg) return;

    appendMessage('user', msg);
    state.sending = true;
    state.dom.input.value = '';
    state.dom.input.disabled = true;
    state.dom.sendBtn.disabled = true;

    // Hide suggestions after first message
    const suggestions = state.dom.panel.querySelector('.suggestions-container');
    if (suggestions) suggestions.style.display = 'none';

    showTypingIndicator();

    // Add user message to history
    state.conversationHistory.push({ role: 'user', text: msg });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: msg,
          history: state.conversationHistory.slice(0, -1)
        })
      });

      hideTypingIndicator();

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.reply || "I didn't get a response.";

      appendMessage('assistant', replyText);
      state.conversationHistory.push({ role: 'assistant', text: replyText });

    } catch (e) {
      hideTypingIndicator();
      console.error(e);
      appendMessage('assistant', "Sorry, I'm having trouble connecting. Please make sure the backend server is running on port 5000.");
    } finally {
      state.sending = false;
      state.dom.input.disabled = false;
      state.dom.sendBtn.disabled = false;
      state.dom.input.focus();
    }
  }

  function toggleChatbot() {
    state.open = !state.open;
    state.dom.panel.setAttribute('aria-hidden', String(!state.open));
    state.dom.panel.classList.toggle('open', state.open);
    state.dom.toggle.classList.toggle('active', state.open);

    if (state.open && !state.hasGreeted) {
      state.hasGreeted = true;
      setTimeout(() => {
        appendMessage('assistant', "Hi! I'm Ram's AI assistant. Ask me anything about his experience, skills, or projects!");
      }, 300);
    }

    if (state.open) {
      setTimeout(() => state.dom.input.focus(), 100);
    }
  }

  function injectStyles() {
    if (document.getElementById('chatbot-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'chatbot-styles';
    styles.textContent = `
      /* Chatbot Root Container */
      .chatbot-root {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      /* Toggle Button */
      .chatbot-toggle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0066ff 0%, #7c3aed 100%);
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0, 102, 255, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }

      .chatbot-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 30px rgba(0, 102, 255, 0.5);
      }

      .chatbot-toggle.active {
        transform: rotate(90deg);
      }

      .chatbot-toggle .icon {
        width: 28px;
        height: 28px;
        fill: white;
        transition: transform 0.3s ease;
      }

      .chatbot-toggle .icon-chat { display: block; }
      .chatbot-toggle .icon-close { display: none; position: absolute; }
      .chatbot-toggle.active .icon-chat { display: none; }
      .chatbot-toggle.active .icon-close { display: block; }

      /* Chat pulse animation */
      .chatbot-toggle::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: inherit;
        animation: pulse 2s infinite;
        z-index: -1;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.2); opacity: 0; }
      }

      /* Chat Panel */
      .chatbot-panel {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 380px;
        height: 550px;
        background: #ffffff;
        border-radius: 20px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px) scale(0.95);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .chatbot-panel.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }

      /* Header */
      .chatbot-header {
        background: linear-gradient(135deg, #0066ff 0%, #7c3aed 100%);
        color: white;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-avatar {
        width: 44px;
        height: 44px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .header-avatar svg {
        width: 24px;
        height: 24px;
        fill: white;
      }

      .header-info {
        flex: 1;
      }

      .header-title {
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 2px;
      }

      .header-status {
        font-size: 12px;
        opacity: 0.9;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        background: #4ade80;
        border-radius: 50%;
        animation: blink 2s infinite;
      }

      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      .chatbot-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .chatbot-close:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .chatbot-close svg {
        width: 18px;
        height: 18px;
        fill: white;
      }

      /* Messages Area */
      .chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: #f8fafc;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      /* Custom scrollbar */
      .chatbot-messages::-webkit-scrollbar {
        width: 6px;
      }

      .chatbot-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .chatbot-messages::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }

      /* Message Styles */
      .chat-message {
        display: flex;
        gap: 10px;
        max-width: 90%;
      }

      .chat-message.user {
        flex-direction: row-reverse;
        margin-left: auto;
      }

      .chat-message.assistant {
        margin-right: auto;
      }

      .chat-message.animate-in {
        animation: messageIn 0.3s ease-out;
      }

      @keyframes messageIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .message-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .chat-message.user .message-avatar {
        background: linear-gradient(135deg, #0066ff, #7c3aed);
        color: white;
      }

      .chat-message.assistant .message-avatar {
        background: #e2e8f0;
        color: #64748b;
      }

      .message-avatar svg {
        width: 20px;
        height: 20px;
      }

      .message-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .chat-message.user .message-content-wrapper {
        align-items: flex-end;
      }

      .message-bubble {
        padding: 12px 16px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.5;
        word-wrap: break-word;
      }

      .chat-message.user .message-bubble {
        background: linear-gradient(135deg, #0066ff 0%, #7c3aed 100%);
        color: white;
        border-bottom-right-radius: 6px;
      }

      .chat-message.assistant .message-bubble {
        background: white;
        color: #1e293b;
        border-bottom-left-radius: 6px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }

      .message-time {
        font-size: 11px;
        color: #94a3b8;
        padding: 0 4px;
      }

      /* Typing Indicator */
      .typing-bubble {
        padding: 16px 20px !important;
      }

      .typing-indicator {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .typing-dot {
        width: 8px;
        height: 8px;
        background: #94a3b8;
        border-radius: 50%;
        animation: typingBounce 1.4s infinite ease-in-out both;
      }

      .typing-dot:nth-child(1) { animation-delay: -0.32s; }
      .typing-dot:nth-child(2) { animation-delay: -0.16s; }
      .typing-dot:nth-child(3) { animation-delay: 0s; }

      @keyframes typingBounce {
        0%, 80%, 100% {
          transform: scale(0.6);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }

      /* Suggestions */
      .suggestions-container {
        padding: 0 20px 16px;
        background: #f8fafc;
      }

      .suggestions-label {
        font-size: 12px;
        color: #64748b;
        margin-bottom: 10px;
        font-weight: 500;
      }

      .suggestion-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .suggestion-pill {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 100px;
        padding: 8px 14px;
        font-size: 12px;
        color: #475569;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
      }

      .suggestion-pill:hover {
        border-color: #0066ff;
        color: #0066ff;
        background: #f0f7ff;
      }

      /* Input Area */
      .chatbot-form {
        padding: 16px 20px;
        background: white;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .chatbot-input {
        flex: 1;
        border: 1px solid #e2e8f0;
        border-radius: 100px;
        padding: 12px 20px;
        font-size: 14px;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .chatbot-input:focus {
        border-color: #0066ff;
        box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
      }

      .chatbot-input::placeholder {
        color: #94a3b8;
      }

      .chatbot-send {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0066ff 0%, #7c3aed 100%);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
        flex-shrink: 0;
      }

      .chatbot-send:hover:not(:disabled) {
        transform: scale(1.05);
        box-shadow: 0 4px 15px rgba(0, 102, 255, 0.4);
      }

      .chatbot-send:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .chatbot-send svg {
        width: 20px;
        height: 20px;
        fill: white;
        margin-left: 2px;
      }

      /* Mobile Responsive */
      @media (max-width: 480px) {
        .chatbot-root {
          bottom: 16px;
          right: 16px;
        }

        .chatbot-panel {
          width: calc(100vw - 32px);
          height: calc(100vh - 150px);
          max-height: 600px;
          right: -8px;
        }

        .chatbot-toggle {
          width: 56px;
          height: 56px;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  function createChatbot() {
    if (state.dom.root) {
      if (!document.body.contains(state.dom.root)) {
        document.body.appendChild(state.dom.root);
      }
      return state.dom.root;
    }

    injectStyles();

    // Toggle button with icons
    const toggle = el('button', { class: 'chatbot-toggle', 'aria-label': 'Open AI Chatbot' });
    toggle.innerHTML = `
      <svg class="icon icon-chat" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
      <svg class="icon icon-close" viewBox="0 0 24 24">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    `;

    // Panel
    const panel = el('div', { class: 'chatbot-panel', role: 'dialog', 'aria-hidden': 'true' });

    // Header
    const header = el('div', { class: 'chatbot-header' });
    header.innerHTML = `
      <div class="header-avatar">
        <svg viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      </div>
      <div class="header-info">
        <div class="header-title">Ram's AI Assistant</div>
        <div class="header-status">
          <span class="status-dot"></span>
          Online - Ask me anything
        </div>
      </div>
    `;

    const closeBtn = el('button', { class: 'chatbot-close', 'aria-label': 'Close chat' });
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
    header.appendChild(closeBtn);

    // Messages area
    const messages = el('div', { class: 'chatbot-messages' });

    // Suggestions
    const suggestions = renderSuggestions();

    // Input form
    const form = el('form', { class: 'chatbot-form' });
    const input = el('input', {
      class: 'chatbot-input',
      type: 'text',
      placeholder: 'Ask about Ram\'s experience...',
      autocomplete: 'off'
    });
    const sendBtn = el('button', { class: 'chatbot-send', type: 'submit', 'aria-label': 'Send message' });
    sendBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
    form.appendChild(input);
    form.appendChild(sendBtn);

    // Assemble panel
    panel.appendChild(header);
    panel.appendChild(messages);
    panel.appendChild(suggestions);
    panel.appendChild(form);

    // Root container
    const root = el('div', { class: 'chatbot-root' }, [toggle, panel]);
    document.body.appendChild(root);

    // Event listeners
    toggle.addEventListener('click', toggleChatbot);
    closeBtn.addEventListener('click', toggleChatbot);
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      sendMessage(input.value);
    });

    // Store references
    state.dom = { root, toggle, panel, header, messages, form, input, sendBtn };

    return root;
  }

  function init() {
    try {
      createChatbot();
    } catch (e) {
      console.error('Failed to initialize chatbot:', e);
    }
  }

  return {
    createChatbot,
    sendMessage,
    appendMessage,
    toggleChatbot,
    init,
    _getState: () => state
  };
}

const Chatbot = ChatbotFactory();
/* istanbul ignore next */
if (typeof module === 'object' && module.exports) {
  module.exports = Chatbot;
  module.exports.ChatbotFactory = ChatbotFactory;
}
/* istanbul ignore next */
if (typeof window !== 'undefined') {
  window.Chatbot = Chatbot;
}
