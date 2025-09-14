/* Minimal AI Chatbot widget that calls /api/chat (server-side Gemini). */
function ChatbotFactory() {
  const state = {
    open: false,
    sending: false,
    dom: {},
  };

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

  function resolveEndpoint() {
    try {
      if (typeof window !== 'undefined' && window.CHAT_API_ENDPOINT) {
        return String(window.CHAT_API_ENDPOINT);
      }
    } catch (e) { /* no-op */ }
    return '/api/chat';
  }

  async function sendMessage(message, fetchImpl = fetch) {
    if (state.sending) return;
    const msg = (message || '').trim();
    if (!msg) return;
    appendMessage('user', msg);
    state.sending = true;
    state.dom.input.value = '';
    state.dom.input.disabled = true;
    state.dom.button.disabled = true;

    try {
      const resp = await fetchImpl(resolveEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: msg }),
      });
      let data;
      try {
        data = await resp.json();
      } catch (e) {
        throw new Error('Invalid JSON from server');
      }
      if (!resp.ok) {
        const err = (data && data.error) || `HTTP ${resp.status}`;
        throw new Error(err);
      }
      const reply = data && data.reply;
      appendMessage('assistant', String(reply || '').trim() || '[No reply]');
    } catch (e) {
      appendMessage('assistant', `Error: ${e.message}`);
    } finally {
      state.sending = false;
      state.dom.input.disabled = false;
      state.dom.button.disabled = false;
      state.dom.input.focus();
    }
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
    return root;
  }

  function init() {
    try { createChatbot(); } catch (e) { /* no-op */ }
  }

  return { createChatbot, sendMessage, appendMessage, toggleChatbot, init };
}

const Chatbot = ChatbotFactory();
/* istanbul ignore next */
if (typeof module === 'object' && module.exports) {
  module.exports = Chatbot;
}
/* istanbul ignore next */
if (typeof window !== 'undefined') {
  window.Chatbot = Chatbot;
}
