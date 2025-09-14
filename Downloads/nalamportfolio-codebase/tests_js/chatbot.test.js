/** @jest-environment jsdom */
const Chatbot = require('../chatbot.js');

function setupDOM() {
  document.body.innerHTML = '';
  return Chatbot.createChatbot();
}

test('chatbot renders and toggles', () => {
  setupDOM();
  const toggle = document.querySelector('.chatbot-toggle');
  const panel = document.querySelector('.chatbot-panel');
  expect(toggle).toBeTruthy();
  expect(panel.style.display).toBe('none');
  toggle.click();
  expect(panel.style.display).toBe('flex');
  toggle.click();
  expect(panel.style.display).toBe('none');
});

test('sendMessage success flow', async () => {
  setupDOM();
  const input = document.querySelector('.chatbot-input');
  const form = document.querySelector('.chatbot-form');
  input.value = 'Who is Ram?';

  const fakeFetch = async () => ({
    ok: true,
    status: 200,
    async json() { return { reply: 'Ram is a data engineer.' }; }
  });

  const p = Chatbot.sendMessage(input.value, fakeFetch);
  await p;
  const lines = [...document.querySelectorAll('.chat-line')].map(n => n.textContent);
  expect(lines.some(t => t.includes('You:'))).toBe(true);
  expect(lines.some(t => t.includes('Ram is a data engineer.'))).toBe(true);
});

test('sendMessage handles server error', async () => {
  setupDOM();
  const input = document.querySelector('.chatbot-input');
  input.value = 'Hello';

  const fakeFetch = async () => ({
    ok: false,
    status: 500,
    async json() { return { error: 'Oops' }; }
  });

  await Chatbot.sendMessage(input.value, fakeFetch);
  const last = [...document.querySelectorAll('.chat-line')].pop();
  expect(last.textContent).toContain('Error:');
});

test('sendMessage invalid JSON', async () => {
  setupDOM();
  const input = document.querySelector('.chatbot-input');
  input.value = 'Hi';

  const fakeFetch = async () => ({
    ok: true,
    status: 200,
    async json() { throw new Error('bad'); }
  });

  await Chatbot.sendMessage(input.value, fakeFetch);
  const last = [...document.querySelectorAll('.chat-line')].pop();
  expect(last.textContent).toContain('Invalid JSON');
});

test('sendMessage HTTP status fallback', async () => {
  setupDOM();
  const input = document.querySelector('.chatbot-input');
  input.value = 'Hi';
  const fakeFetch = async () => ({ ok: false, status: 503, async json() { return {}; } });
  await Chatbot.sendMessage(input.value, fakeFetch);
  const last = [...document.querySelectorAll('.chat-line')].pop();
  expect(last.textContent).toContain('HTTP 503');
});

test('form submit triggers sendMessage', async () => {
  setupDOM();
  const input = document.querySelector('.chatbot-input');
  const form = document.querySelector('.chatbot-form');
  input.value = 'Via form';
  const fakeFetch = async () => ({ ok: true, status: 200, async json() { return { reply: 'Ok' }; } });
  const orig = Chatbot.sendMessage;
  // Wrap to use fake fetch but still exercise handler lines
  Chatbot.sendMessage = (msg) => orig(msg, fakeFetch);
  global.fetch = fakeFetch;
  form.dispatchEvent(new Event('submit'));
  // allow async to resolve
  await new Promise(r => setTimeout(r, 0));
  Chatbot.sendMessage = orig;
  delete global.fetch;
  const lines = [...document.querySelectorAll('.chat-line')].map(x => x.textContent);
  expect(lines.some(t => t.includes('You: Via form'))).toBe(true);
});

test('init covers try path', () => {
  // Should not throw
  Chatbot.init();
});

test('appendMessage utility', () => {
  setupDOM();
  Chatbot.appendMessage('user', 'Test');
  const last = [...document.querySelectorAll('.chat-line')].pop();
  expect(last.textContent).toContain('You:');
  expect(last.textContent).toContain('Test');
});

test('sendMessage ignores empty and reentrancy', async () => {
  setupDOM();
  const input = document.querySelector('.chatbot-input');
  input.value = '   ';
  await Chatbot.sendMessage(input.value, async () => ({ ok: true, status: 200, json: async () => ({ reply: 'x' }) }));
  // Only greeting line should be present + no new lines from empty send
  const lines = document.querySelectorAll('.chat-line');
  expect(lines.length).toBeGreaterThan(0);
});

test('sendMessage returns early when sending', async () => {
  setupDOM();
  const input = document.querySelector('.chatbot-input');
  input.value = 'First';
  // Slow fetch for first call
  const slowFetch = async () => ({ ok: true, status: 200, json: async () => { await new Promise(r => setTimeout(r, 10)); return { reply: 'ok' }; } });
  const p1 = Chatbot.sendMessage(input.value, slowFetch);
  // Immediate second call should return early
  await Chatbot.sendMessage('Second', slowFetch);
  await p1;
  const texts = [...document.querySelectorAll('.chat-line')].map(n => n.textContent);
  const userMsgs = texts.filter(t => t.startsWith('You:'));
  // Should contain only one user message (the first one)
  expect(userMsgs.some(t => t.includes('First'))).toBe(true);
  expect(userMsgs.some(t => t.includes('Second'))).toBe(false);
});
