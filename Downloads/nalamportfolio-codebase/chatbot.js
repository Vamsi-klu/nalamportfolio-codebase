/* AI Chatbot widget with intelligent client-side responses for Ramachandra's portfolio. */
function ChatbotFactory() {
  const state = {
    open: false,
    sending: false,
    dom: {},
    knowledgeBase: null
  };

  // Load knowledge base from JSON
  async function loadKnowledgeBase() {
    if (state.knowledgeBase) return state.knowledgeBase;

    try {
      const response = await fetch('chatbot-knowledge.json');
      if (!response.ok) {
        throw new Error(`Failed to load knowledge base: ${response.status}`);
      }
      state.knowledgeBase = await response.json();
      return state.knowledgeBase;
    } catch (error) {
      console.error('Error loading knowledge base:', error);
      // Fallback to minimal embedded knowledge
      state.knowledgeBase = {
        default: {
          response: "I'm having trouble loading my knowledge base. Please try refreshing the page or contact Ramachandra directly at nrcvamsi@gmail.com."
        }
      };
      return state.knowledgeBase;
    }
  }

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v);
    }
    for (const c of children) node.appendChild(c);
    return node;
  }

  function appendMessage(role, text) {
    const line = el('div', { class: `chat-line chat-${role}` });
    const b = el('b', { text: role === 'user' ? 'You: ' : 'Assistant: ' });
    const span = el('span');
    span.textContent = text;
    line.appendChild(b);
    line.appendChild(span);
    state.dom.log.appendChild(line);
    state.dom.log.scrollTop = state.dom.log.scrollHeight;
  }

  async function findBestResponse(message) {
    const kb = await loadKnowledgeBase();
    const msgLower = message.toLowerCase();

    // Check for greetings
    if (kb.greeting && kb.greeting.pattern) {
      const greetingRegex = new RegExp(kb.greeting.pattern, 'i');
      if (greetingRegex.test(message)) {
        return kb.greeting.response;
      }
    }

    // Score each category based on keyword matches
    let bestMatch = null;
    let highestScore = 0;

    for (const [category, data] of Object.entries(kb)) {
      if (category === 'greeting' || category === 'default' || !data.keywords) continue;

      let score = 0;
      for (const keyword of data.keywords) {
        if (msgLower.includes(keyword)) {
          score += 1;
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = data.response;
      }
    }

    if (bestMatch && highestScore > 0) {
      return bestMatch;
    }

    // Default response
    return kb.default ? kb.default.response : "I'm here to help! Ask me anything about Ramachandra.";
  }

  async function sendMessage(message) {
    if (state.sending) return;
    const msg = (message || '').trim();
    if (!msg) return;

    appendMessage('user', msg);
    state.sending = true;
    state.dom.input.value = '';
    state.dom.input.disabled = true;
    state.dom.button.disabled = true;

    // Simulate brief thinking time for better UX
    setTimeout(async () => {
      try {
        const response = await findBestResponse(msg);
        appendMessage('assistant', response);
      } catch (e) {
        appendMessage('assistant', "I'm having trouble responding right now. Please try asking about Ramachandra's experience, skills, projects, or contact information.");
        console.error('Chatbot error:', e);
      } finally {
        state.sending = false;
        state.dom.input.disabled = false;
        state.dom.button.disabled = false;
        state.dom.input.focus();
      }
    }, 500); // Small delay for natural feel
  }

  function toggleChatbot() {
    state.open = !state.open;
    state.dom.panel.setAttribute('aria-hidden', String(!state.open));
    state.dom.panel.style.display = state.open ? 'flex' : 'none';
  }

  function createChatbot() {
    if (state.dom.root) {
      // Re-attach if DOM was cleared between tests or navigations
      if (!document.body.contains(state.dom.root)) {
        document.body.appendChild(state.dom.root);
      }
      return state.dom.root;
    }

    const toggle = el('button', { class: 'chatbot-toggle', 'aria-label': 'Open AI Chatbot' });
    toggle.textContent = '💬';
    const panel = el('div', { class: 'chatbot-panel', role: 'dialog', 'aria-hidden': 'true' });
    const header = el('div', { class: 'chatbot-header' });
    header.appendChild(el('span', { class: 'chatbot-title', text: 'Ask about Ramachandra' }));
    const close = el('button', { class: 'chatbot-close', 'aria-label': 'Close' }, [el('span', { text: '×' })]);
    header.appendChild(close);
    const log = el('div', { class: 'chatbot-log' });
    const form = el('form', { class: 'chatbot-form' });
    const input = el('input', { class: 'chatbot-input', type: 'text', placeholder: 'Ask a question…', autocomplete: 'off' });
    const send = el('button', { class: 'chatbot-send', type: 'submit' }, [el('span', { text: 'Send' })]);
    form.appendChild(input);
    form.appendChild(send);
    panel.appendChild(header);
    panel.appendChild(log);
    panel.appendChild(form);

    const root = el('div', { class: 'chatbot-root' }, [toggle, panel]);
    document.body.appendChild(root);

    // Bind
    toggle.addEventListener('click', toggleChatbot);
    close.addEventListener('click', toggleChatbot);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      sendMessage(input.value);
    });

    // Default hidden inline for environments without CSS (e.g., jsdom)
    panel.style.display = 'none';

    // Store references
    state.dom = { root, toggle, panel, header, log, form, input, button: send };

    // Greet
    appendMessage('assistant', 'Hi! Ask me anything about Ramachandra.');

    // Preload knowledge base
    loadKnowledgeBase().catch(e => console.error('Failed to preload knowledge base:', e));

    return root;
  }

  function init() {
    try {
      createChatbot();
    } catch (e) {
      console.error('Failed to initialize chatbot:', e);
    }
  }

  // Expose method to reset/reload knowledge base (useful for testing)
  function reloadKnowledgeBase() {
    state.knowledgeBase = null;
    return loadKnowledgeBase();
  }

  return {
    createChatbot,
    sendMessage,
    appendMessage,
    toggleChatbot,
    init,
    loadKnowledgeBase,
    reloadKnowledgeBase,
    // Expose for testing
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
