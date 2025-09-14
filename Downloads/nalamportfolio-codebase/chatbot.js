/* AI Chatbot widget with intelligent client-side responses for Ramachandra's portfolio. */
function ChatbotFactory() {
  const state = {
    open: false,
    sending: false,
    dom: {},
  };

  // Knowledge base about Ramachandra for smart responses
  const knowledgeBase = {
    experience: {
      keywords: ['experience', 'work', 'job', 'career', 'meta', 'amazon', 'nike', 'buffalo'],
      response: "Ramachandra has 7+ years of data engineering experience. Currently at Meta as a Data Engineer handling 50B+ daily events. Previously worked at Amazon (ETL optimization), University at Buffalo (ML for student success), and Nike India (large-scale data processing)."
    },
    skills: {
      keywords: ['skills', 'technology', 'tech', 'tools', 'programming', 'languages', 'python', 'spark', 'kafka'],
      response: "Ramachandra's technical skills include Python, R, Scala, SQL, JavaScript, Apache Spark, Kafka, Airflow, AWS (Glue, S3, Redshift), Snowflake, dbt, Tableau, Power BI, and machine learning with TensorFlow."
    },
    projects: {
      keywords: ['projects', 'project', 'work', 'built', 'developed', 'chatbot', 'analytics', 'pipeline'],
      response: "Key projects include: Real-time Messaging Analytics at Meta (50B+ events/day), AWS Streaming & ETL at Amazon, Student Success Analytics using ML at University at Buffalo, Enterprise ETL Platform at Nike, and GenAI chatbot systems."
    },
    education: {
      keywords: ['education', 'degree', 'university', 'college', 'study', 'buffalo', 'data science'],
      response: "Ramachandra holds a Master of Science in Data Science from University at Buffalo (2021-2022) and a Bachelor of Technology in Computer Science from K L University (2014-2018)."
    },
    contact: {
      keywords: ['contact', 'email', 'phone', 'linkedin', 'reach', 'connect', 'hire', 'available'],
      response: "You can reach Ramachandra at nrcvamsi@gmail.com, phone: +1 (508) 614-0301, or connect on LinkedIn: linkedin.com/in/ramachandra-nalam/. Located in Seattle, WA."
    },
    location: {
      keywords: ['location', 'where', 'based', 'seattle', 'live', 'remote'],
      response: "Ramachandra is currently based in Seattle, WA and works at Meta. He's experienced with both on-site and remote work environments."
    },
    achievements: {
      keywords: ['achievements', 'success', 'impact', 'results', 'metrics', 'improvement'],
      response: "Notable achievements: 60% reduction in data modeling complexity, 99.9% data accuracy, 40% cost reduction in Snowflake, 35% reduction in data lag, 52% CPU utilization improvement, and 23% increase in graduation rates through ML predictions."
    }
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

  function findBestResponse(message) {
    const msgLower = message.toLowerCase();

    // Check for greetings
    if (/^(hi|hello|hey|greetings)/i.test(message)) {
      return "Hi! I'm here to help you learn about Ramachandra Nalam, a Data Engineer at Meta. Ask me about his experience, skills, projects, or how to get in touch!";
    }

    // Score each category based on keyword matches
    let bestMatch = null;
    let highestScore = 0;

    for (const [category, data] of Object.entries(knowledgeBase)) {
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

    // Default response for unmatched queries
    return "I can help you learn about Ramachandra's experience at Meta, Amazon, and other companies, his technical skills in data engineering, his projects, education, or contact information. What would you like to know?";
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
    setTimeout(() => {
      try {
        const response = findBestResponse(msg);
        appendMessage('assistant', response);
      } catch (e) {
        appendMessage('assistant', "I'm having trouble responding right now. Please try asking about Ramachandra's experience, skills, projects, or contact information.");
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
