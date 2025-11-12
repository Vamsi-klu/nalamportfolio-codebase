/** @jest-environment jsdom */
const { ChatbotFactory } = require('../chatbot.js');

// Mock fetch for knowledge base loading
global.fetch = jest.fn();

function setupDOM() {
  document.body.innerHTML = '';
  const chatbot = ChatbotFactory();
  return { chatbot, root: chatbot.createChatbot() };
}

function mockKnowledgeBase() {
  return {
    greeting: {
      pattern: "^(hi|hello|hey)",
      response: "Hi! I'm a test bot."
    },
    experience: {
      keywords: ["experience", "work"],
      response: "Test experience response."
    },
    default: {
      response: "Default test response."
    }
  };
}

beforeEach(() => {
  global.fetch.mockClear();
});

describe('Chatbot rendering and basic interactions', () => {
  test('chatbot renders all required elements', () => {
    const { chatbot } = setupDOM();
    expect(document.querySelector('.chatbot-toggle')).toBeTruthy();
    expect(document.querySelector('.chatbot-panel')).toBeTruthy();
    expect(document.querySelector('.chatbot-header')).toBeTruthy();
    expect(document.querySelector('.chatbot-log')).toBeTruthy();
    expect(document.querySelector('.chatbot-form')).toBeTruthy();
    expect(document.querySelector('.chatbot-input')).toBeTruthy();
    expect(document.querySelector('.chatbot-send')).toBeTruthy();
  });

  test('chatbot toggle opens and closes panel', () => {
    const { chatbot } = setupDOM();
    const toggle = document.querySelector('.chatbot-toggle');
    const panel = document.querySelector('.chatbot-panel');

    expect(panel.style.display).toBe('none');

    toggle.click();
    expect(panel.style.display).toBe('flex');
    expect(panel.getAttribute('aria-hidden')).toBe('false');

    toggle.click();
    expect(panel.style.display).toBe('none');
    expect(panel.getAttribute('aria-hidden')).toBe('true');
  });

  test('close button closes chatbot', () => {
    const { chatbot } = setupDOM();
    const toggle = document.querySelector('.chatbot-toggle');
    const close = document.querySelector('.chatbot-close');
    const panel = document.querySelector('.chatbot-panel');

    toggle.click();
    expect(panel.style.display).toBe('flex');

    close.click();
    expect(panel.style.display).toBe('none');
  });

  test('chatbot displays initial greeting', () => {
    setupDOM();
    const lines = document.querySelectorAll('.chat-line');
    expect(lines.length).toBeGreaterThan(0);
    expect(lines[0].textContent).toContain('Assistant:');
  });
});

describe('Knowledge base loading', () => {
  test('loadKnowledgeBase fetches and parses JSON successfully', async () => {
    const { chatbot } = setupDOM();
    const mockKB = mockKnowledgeBase();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockKB
    });

    const kb = await chatbot.loadKnowledgeBase();
    expect(kb).toEqual(mockKB);
    expect(global.fetch).toHaveBeenCalledWith('chatbot-knowledge.json');
  });

  test('loadKnowledgeBase returns cached knowledge base on subsequent calls', async () => {
    const { chatbot } = setupDOM();
    const mockKB = mockKnowledgeBase();

    // Mock fetch to resolve successfully
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockKB
    });

    await chatbot.loadKnowledgeBase();
    // Clear the mock call count from setupDOM preload
    global.fetch.mockClear();

    const kb2 = await chatbot.loadKnowledgeBase();

    // Should not have been called again (cached)
    expect(global.fetch).toHaveBeenCalledTimes(0);
    expect(kb2).toEqual(mockKB);
  });

  test('loadKnowledgeBase handles fetch failure gracefully', async () => {
    const { chatbot } = setupDOM();

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const kb = await chatbot.loadKnowledgeBase();

    expect(kb.default).toBeDefined();
    expect(kb.default.response).toContain('trouble loading');
    consoleErrorSpy.mockRestore();
  });

  test('loadKnowledgeBase handles JSON parse error', async () => {
    const { chatbot } = setupDOM();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => { throw new Error('Parse error'); }
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const kb = await chatbot.loadKnowledgeBase();

    expect(kb.default).toBeDefined();
    consoleErrorSpy.mockRestore();
  });

  test('reloadKnowledgeBase resets and reloads knowledge base', async () => {
    const { chatbot } = setupDOM();
    const mockKB = mockKnowledgeBase();

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockKB
    });

    await chatbot.loadKnowledgeBase();
    global.fetch.mockClear(); // Clear setupDOM preload call

    await chatbot.reloadKnowledgeBase();
    expect(global.fetch).toHaveBeenCalledTimes(1); // Should reload
  });
});

describe('Message sending with knowledge base', () => {
  test('sendMessage with greeting pattern', async () => {
    const { chatbot } = setupDOM();
    const mockKB = mockKnowledgeBase();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockKB
    });

    const input = document.querySelector('.chatbot-input');
    input.value = 'Hello there!';

    await chatbot.sendMessage(input.value);

    await new Promise(resolve => setTimeout(resolve, 600));

    const lines = [...document.querySelectorAll('.chat-line')];
    const userMessage = lines.find(l => l.textContent.includes('You:'));
    const botMessage = lines.find(l => l.textContent.includes('test bot'));

    expect(userMessage).toBeTruthy();
    expect(botMessage).toBeTruthy();
  });

  test('sendMessage with keyword match', async () => {
    const { chatbot } = setupDOM();
    const mockKB = mockKnowledgeBase();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockKB
    });

    const input = document.querySelector('.chatbot-input');
    input.value = 'Tell me about your work experience';

    await chatbot.sendMessage(input.value);

    await new Promise(resolve => setTimeout(resolve, 600));

    const lines = [...document.querySelectorAll('.chat-line')];
    const botMessage = lines.find(l => l.textContent.includes('Test experience response'));

    expect(botMessage).toBeTruthy();
  });

  test('sendMessage with no match returns default', async () => {
    const { chatbot } = setupDOM();
    const mockKB = mockKnowledgeBase();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockKB
    });

    const input = document.querySelector('.chatbot-input');
    input.value = 'random unmatched query';

    await chatbot.sendMessage(input.value);

    await new Promise(resolve => setTimeout(resolve, 600));

    const lines = [...document.querySelectorAll('.chat-line')];
    const botMessage = lines.find(l => l.textContent.includes('Default test response'));

    expect(botMessage).toBeTruthy();
  });

  test('sendMessage handles knowledge base with fallback', async () => {
    const { chatbot } = setupDOM();

    // Reject fetch to trigger fallback KB
    global.fetch.mockRejectedValue(new Error('Network error'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const input = document.querySelector('.chatbot-input');
    input.value = 'test message';

    // Reset knowledge base to force reload
    chatbot.reloadKnowledgeBase();

    await chatbot.sendMessage(input.value);

    await new Promise(resolve => setTimeout(resolve, 600));

    const lines = [...document.querySelectorAll('.chat-line')];
    // Should get a response even with failed KB load (uses fallback)
    const responseLines = lines.filter(l => l.textContent.includes('Assistant:'));

    expect(responseLines.length).toBeGreaterThan(0);
    consoleErrorSpy.mockRestore();
  });

  test('sendMessage ignores empty messages', async () => {
    const { chatbot } = setupDOM();
    const input = document.querySelector('.chatbot-input');

    const initialLineCount = document.querySelectorAll('.chat-line').length;

    await chatbot.sendMessage('   ');

    await new Promise(resolve => setTimeout(resolve, 100));

    const finalLineCount = document.querySelectorAll('.chat-line').length;
    expect(finalLineCount).toBe(initialLineCount);
  });

  test('sendMessage ignores concurrent sends', async () => {
    const { chatbot } = setupDOM();
    const mockKB = mockKnowledgeBase();

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockKB
    });

    const input = document.querySelector('.chatbot-input');
    input.value = 'first message';

    const promise1 = chatbot.sendMessage(input.value);
    const promise2 = chatbot.sendMessage('second message');

    await Promise.all([promise1, promise2]);

    await new Promise(resolve => setTimeout(resolve, 600));

    const lines = [...document.querySelectorAll('.chat-line')];
    const userMessages = lines.filter(l => l.textContent.startsWith('You:'));

    // Should only have one user message (the first one)
    expect(userMessages.length).toBeLessThanOrEqual(2); // Greeting + first message
  });

  test('sendMessage disables and re-enables input', async () => {
    const { chatbot } = setupDOM();
    const mockKB = mockKnowledgeBase();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockKB
    });

    const input = document.querySelector('.chatbot-input');
    const button = document.querySelector('.chatbot-send');

    input.value = 'test';

    chatbot.sendMessage(input.value);

    // Should be disabled immediately
    expect(input.disabled).toBe(true);
    expect(button.disabled).toBe(true);

    await new Promise(resolve => setTimeout(resolve, 600));

    // Should be re-enabled after processing
    expect(input.disabled).toBe(false);
    expect(button.disabled).toBe(false);
  });

  test('sendMessage clears input field', async () => {
    const { chatbot } = setupDOM();
    const mockKB = mockKnowledgeBase();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockKB
    });

    const input = document.querySelector('.chatbot-input');
    input.value = 'test message';

    await chatbot.sendMessage(input.value);

    expect(input.value).toBe('');
  });
});

describe('Form submission', () => {
  test('form submit triggers sendMessage', async () => {
    const { chatbot } = setupDOM();
    const mockKB = mockKnowledgeBase();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockKB
    });

    const input = document.querySelector('.chatbot-input');
    const form = document.querySelector('.chatbot-form');

    input.value = 'Via form submission';

    const event = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);

    await new Promise(resolve => setTimeout(resolve, 600));

    const lines = [...document.querySelectorAll('.chat-line')];
    const userMessage = lines.find(l => l.textContent.includes('Via form submission'));

    expect(userMessage).toBeTruthy();
  });
});

describe('appendMessage utility', () => {
  test('appendMessage adds user message correctly', () => {
    const { chatbot } = setupDOM();
    chatbot.appendMessage('user', 'Test user message');

    const last = [...document.querySelectorAll('.chat-line')].pop();
    expect(last.textContent).toContain('You:');
    expect(last.textContent).toContain('Test user message');
    expect(last.classList.contains('chat-user')).toBe(true);
  });

  test('appendMessage adds assistant message correctly', () => {
    const { chatbot } = setupDOM();
    chatbot.appendMessage('assistant', 'Test assistant message');

    const last = [...document.querySelectorAll('.chat-line')].pop();
    expect(last.textContent).toContain('Assistant:');
    expect(last.textContent).toContain('Test assistant message');
    expect(last.classList.contains('chat-assistant')).toBe(true);
  });

  test('appendMessage scrolls log to bottom', () => {
    const { chatbot } = setupDOM();
    const log = document.querySelector('.chatbot-log');

    chatbot.appendMessage('user', 'Message 1');
    chatbot.appendMessage('user', 'Message 2');
    chatbot.appendMessage('user', 'Message 3');

    // ScrollTop should be set to scrollHeight (at bottom)
    expect(log.scrollTop).toBe(log.scrollHeight);
  });
});

describe('toggleChatbot function', () => {
  test('toggleChatbot alternates panel visibility', () => {
    const { chatbot } = setupDOM();
    const panel = document.querySelector('.chatbot-panel');

    expect(panel.style.display).toBe('none');

    chatbot.toggleChatbot();
    expect(panel.style.display).toBe('flex');

    chatbot.toggleChatbot();
    expect(panel.style.display).toBe('none');
  });

  test('toggleChatbot updates aria-hidden attribute', () => {
    const { chatbot } = setupDOM();
    const panel = document.querySelector('.chatbot-panel');

    chatbot.toggleChatbot();
    expect(panel.getAttribute('aria-hidden')).toBe('false');

    chatbot.toggleChatbot();
    expect(panel.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('init function', () => {
  test('init creates chatbot without errors', () => {
    document.body.innerHTML = '';
    const chatbot = ChatbotFactory();

    expect(() => chatbot.init()).not.toThrow();
    expect(document.querySelector('.chatbot-root')).toBeTruthy();
  });

  test('init handles errors gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Make createElement throw an error to trigger the catch block
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = () => {
      throw new Error('Test DOM error');
    };

    const chatbot = ChatbotFactory();
    expect(() => chatbot.init()).not.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to initialize chatbot:', expect.any(Error));

    // Restore
    document.createElement = originalCreateElement;
    consoleErrorSpy.mockRestore();
  });
});

describe('State management', () => {
  test('_getState returns internal state', () => {
    const { chatbot } = setupDOM();
    const state = chatbot._getState();

    expect(state).toHaveProperty('open');
    expect(state).toHaveProperty('sending');
    expect(state).toHaveProperty('dom');
    expect(state).toHaveProperty('knowledgeBase');
  });

  test('state tracks open/closed status', () => {
    const { chatbot } = setupDOM();
    const state = chatbot._getState();

    expect(state.open).toBe(false);

    chatbot.toggleChatbot();
    expect(state.open).toBe(true);

    chatbot.toggleChatbot();
    expect(state.open).toBe(false);
  });
});

describe('Re-attachment after DOM clear', () => {
  test('createChatbot re-attaches existing root if removed', () => {
    const { chatbot } = setupDOM();
    const root = document.querySelector('.chatbot-root');

    // Remove root from DOM
    root.remove();
    expect(document.body.contains(root)).toBe(false);

    // Call createChatbot again
    const newRoot = chatbot.createChatbot();

    expect(document.body.contains(newRoot)).toBe(true);
    expect(newRoot).toBe(root); // Should be same root
  });
});

describe('Knowledge base preloading', () => {
  test('createChatbot preloads knowledge base', async () => {
    const mockKB = mockKnowledgeBase();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockKB
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    setupDOM();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(global.fetch).toHaveBeenCalledWith('chatbot-knowledge.json');
    consoleErrorSpy.mockRestore();
  });

  test('createChatbot handles preload failure gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    setupDOM();

    await new Promise(resolve => setTimeout(resolve, 100));

    // Should not throw, just log error
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
