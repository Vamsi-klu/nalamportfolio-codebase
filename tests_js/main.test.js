/** @jest-environment jsdom */

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.elements = [];
  }

  observe(element) {
    this.elements.push(element);
    // Immediately trigger callback for testing
    setTimeout(() => {
      this.callback([{
        target: element,
        isIntersecting: true
      }], this);
    }, 0);
  }

  unobserve(element) {
    const index = this.elements.indexOf(element);
    if (index > -1) {
      this.elements.splice(index, 1);
    }
  }

  disconnect() {
    this.elements = [];
  }

  // Expose method to manually trigger callbacks
  triggerCallback(entries) {
    this.callback(entries, this);
  }
}

global.IntersectionObserver = IntersectionObserverMock;

const Portfolio = require('../main.js');

describe('ThemeManager', () => {
  let eventListeners = [];

  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');

    // Clean up event listeners
    eventListeners.forEach(({ event, handler }) => {
      window.removeEventListener(event, handler);
    });
    eventListeners = [];
  });

  test('getCurrentTheme returns default light theme', () => {
    expect(Portfolio.ThemeManager.getCurrentTheme()).toBe('light');
  });

  test('setTheme updates theme attribute and localStorage', () => {
    Portfolio.ThemeManager.setTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  test('setTheme throws error for invalid theme', () => {
    expect(() => {
      Portfolio.ThemeManager.setTheme('invalid');
    }).toThrow('Invalid theme: invalid');
  });

  test('toggleTheme switches between themes', () => {
    Portfolio.ThemeManager.setTheme('light');
    const newTheme = Portfolio.ThemeManager.toggleTheme();
    expect(newTheme).toBe('dark');
    expect(Portfolio.ThemeManager.getCurrentTheme()).toBe('dark');

    const backToLight = Portfolio.ThemeManager.toggleTheme();
    expect(backToLight).toBe('light');
  });

  test('initTheme loads saved theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    Portfolio.ThemeManager.initTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('initTheme defaults to light if no saved theme', () => {
    Portfolio.ThemeManager.initTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  test('updateThemeIcon updates icon text', () => {
    document.body.innerHTML = '<span class="theme-icon"></span>';
    Portfolio.ThemeManager.updateThemeIcon('dark');
    expect(document.querySelector('.theme-icon').textContent).toBe('☀️');

    Portfolio.ThemeManager.updateThemeIcon('light');
    expect(document.querySelector('.theme-icon').textContent).toBe('🌙');
  });

  test('updateThemeIcon handles missing element gracefully', () => {
    expect(() => Portfolio.ThemeManager.updateThemeIcon('dark')).not.toThrow();
  });

  test('dispatchThemeChange fires custom event', (done) => {
    window.addEventListener('themechange', (e) => {
      expect(e.detail.theme).toBe('dark');
      done();
    });
    Portfolio.ThemeManager.dispatchThemeChange('dark');
  });
});

describe('NavbarManager', () => {
  beforeEach(() => {
    document.body.innerHTML = '<nav class="navbar"></nav>';
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
    // Reset theme to light
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  });

  test('updateNavbar applies light theme styles when not scrolled', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    Portfolio.NavbarManager.updateNavbar();
    const navbar = document.querySelector('.navbar');
    expect(navbar.style.background).toBe('rgba(255, 255, 255, 0.95)');
    expect(navbar.style.boxShadow).toBe('none');
  });

  test('updateNavbar applies dark theme styles when not scrolled', () => {
    Portfolio.ThemeManager.setTheme('dark');
    Portfolio.NavbarManager.updateNavbar();
    const navbar = document.querySelector('.navbar');
    expect(navbar.style.background).toBe('rgba(17, 24, 39, 0.95)');
    expect(navbar.style.boxShadow).toBe('none');
  });

  test('updateNavbar applies scrolled styles', () => {
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true, configurable: true });
    document.documentElement.setAttribute('data-theme', 'light');
    Portfolio.NavbarManager.updateNavbar();
    const navbar = document.querySelector('.navbar');
    expect(navbar.style.background).toBe('rgba(255, 255, 255, 0.98)');
    expect(navbar.style.boxShadow).toBe('0 2px 20px rgba(0, 0, 0, 0.1)');
  });

  test('updateNavbar handles missing navbar gracefully', () => {
    document.body.innerHTML = '';
    expect(() => Portfolio.NavbarManager.updateNavbar()).not.toThrow();
  });

  test('init sets up scroll and theme listeners', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    Portfolio.NavbarManager.init();

    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
    expect(addEventListenerSpy).toHaveBeenCalledWith('themechange', expect.any(Function));

    addEventListenerSpy.mockRestore();
  });
});

describe('TypingAnimation', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="typing-text"></div>';
    Portfolio.TypingAnimation.state = {
      currentRole: 0,
      currentChar: 0,
      isDeleting: false,
      timeoutId: null
    };
    jest.useFakeTimers();
  });

  afterEach(() => {
    Portfolio.TypingAnimation.stop();
    jest.useRealTimers();
  });

  test('setup initializes typing animation', () => {
    Portfolio.TypingAnimation.setup();
    expect(Portfolio.TypingAnimation.element).toBeTruthy();
  });

  test('setup handles missing element gracefully', () => {
    document.body.innerHTML = '';
    expect(() => Portfolio.TypingAnimation.setup()).not.toThrow();
  });

  test('type updates element textContent progressively', () => {
    Portfolio.TypingAnimation.setup();

    // Simulate typing forward
    Portfolio.TypingAnimation.type();
    expect(document.querySelector('.typing-text').textContent.length).toBeGreaterThan(0);

    jest.advanceTimersByTime(100);
    Portfolio.TypingAnimation.type();
    expect(document.querySelector('.typing-text').textContent.length).toBeGreaterThan(0);
  });

  test('type handles deletion phase', () => {
    Portfolio.TypingAnimation.setup();
    Portfolio.TypingAnimation.state.isDeleting = true;
    Portfolio.TypingAnimation.state.currentChar = 5;

    Portfolio.TypingAnimation.type();
    expect(Portfolio.TypingAnimation.state.currentChar).toBe(4);
  });

  test('type cycles to next role after deletion', () => {
    Portfolio.TypingAnimation.setup();
    Portfolio.TypingAnimation.state.isDeleting = true;
    Portfolio.TypingAnimation.state.currentChar = 1;
    Portfolio.TypingAnimation.state.currentRole = 0;

    Portfolio.TypingAnimation.type();

    expect(Portfolio.TypingAnimation.state.currentChar).toBe(0);
    expect(Portfolio.TypingAnimation.state.isDeleting).toBe(false);
    expect(Portfolio.TypingAnimation.state.currentRole).toBe(1);
  });

  test('type pauses at end of word before deleting', () => {
    Portfolio.TypingAnimation.setup();
    const currentRole = Portfolio.TypingAnimation.roles[0];
    Portfolio.TypingAnimation.state.currentChar = currentRole.length - 1;
    Portfolio.TypingAnimation.state.isDeleting = false;

    Portfolio.TypingAnimation.type();

    expect(Portfolio.TypingAnimation.state.isDeleting).toBe(true);
  });

  test('stop clears timeout', () => {
    Portfolio.TypingAnimation.state.timeoutId = setTimeout(() => {}, 1000);
    const timeoutId = Portfolio.TypingAnimation.state.timeoutId;
    Portfolio.TypingAnimation.stop();
    expect(Portfolio.TypingAnimation.state.timeoutId).toBeNull();
  });
});

describe('Utils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('debounce delays function execution', () => {
    let counter = 0;
    const debouncedFn = Portfolio.Utils.debounce(() => { counter++; }, 50);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(counter).toBe(0);

    jest.advanceTimersByTime(50);
    expect(counter).toBe(1);
  });

  test('debounce passes arguments correctly', () => {
    let result = null;
    const debouncedFn = Portfolio.Utils.debounce((a, b) => { result = a + b; }, 50);

    debouncedFn(5, 10);

    jest.advanceTimersByTime(50);
    expect(result).toBe(15);
  });
});

describe('NavigationManager', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="hamburger"></div>
      <ul class="nav-menu">
        <li><a href="#home" class="nav-link">Home</a></li>
        <li><a href="#about" class="nav-link">About</a></li>
      </ul>
      <section id="home">Home</section>
      <section id="about">About</section>
    `;
  });

  test('setupMobileMenu toggles hamburger on click', () => {
    Portfolio.NavigationManager.setupMobileMenu();
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.click();
    expect(hamburger.classList.contains('active')).toBe(true);
    expect(navMenu.classList.contains('active')).toBe(true);

    hamburger.click();
    expect(hamburger.classList.contains('active')).toBe(false);
    expect(navMenu.classList.contains('active')).toBe(false);
  });

  test('setupMobileMenu closes menu when nav link clicked', () => {
    Portfolio.NavigationManager.setupMobileMenu();
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLink = document.querySelector('.nav-link');

    hamburger.click();
    expect(hamburger.classList.contains('active')).toBe(true);

    navLink.click();
    expect(hamburger.classList.contains('active')).toBe(false);
    expect(navMenu.classList.contains('active')).toBe(false);
  });

  test('setupMobileMenu handles missing elements gracefully', () => {
    document.body.innerHTML = '';
    expect(() => Portfolio.NavigationManager.setupMobileMenu()).not.toThrow();
  });

  test('setupActiveLink handles empty sections gracefully', () => {
    document.body.innerHTML = '<a href="#home" class="nav-link">Home</a>';
    expect(() => Portfolio.NavigationManager.setupActiveLink()).not.toThrow();
  });

  test('setupActiveLink handles empty nav links gracefully', () => {
    document.body.innerHTML = '<section id="home">Home</section>';
    expect(() => Portfolio.NavigationManager.setupActiveLink()).not.toThrow();
  });

  test('setupActiveLink creates IntersectionObserver', async () => {
    Portfolio.NavigationManager.setupActiveLink();

    // Wait for IntersectionObserver mock callback to execute
    await new Promise(resolve => setTimeout(resolve, 100));

    // The mock fires callbacks for all sections, so the last section (#about) will be active
    const aboutLink = document.querySelector('a[href="#about"]');
    expect(aboutLink.classList.contains('active')).toBe(true);
  });

  test('setupSmoothScrolling handles anchor clicks', () => {
    Portfolio.NavigationManager.setupSmoothScrolling();
    const link = document.querySelector('a[href="#home"]');
    const scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation();

    const event = new Event('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);

    expect(scrollSpy).toHaveBeenCalled();
    scrollSpy.mockRestore();
  });

  test('setupSmoothScrolling handles clicks on non-anchor elements', () => {
    Portfolio.NavigationManager.setupSmoothScrolling();
    const div = document.createElement('div');
    document.body.appendChild(div);

    const scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation();
    div.click();

    expect(scrollSpy).not.toHaveBeenCalled();
    scrollSpy.mockRestore();
  });
});

describe('AccessibilityManager', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <a href="#main" class="skip-link">Skip</a>
      <main id="main" tabindex="-1">Main content</main>
      <div class="project-card">Project 1</div>
      <div class="project-card">Project 2</div>
      <nav>
        <a href="#home" class="nav-link">Home</a>
      </nav>
      <section id="home">Home</section>
    `;
  });

  test('setupSkipLink handles skip link clicks', () => {
    Portfolio.AccessibilityManager.setupSkipLink();
    const skipLink = document.querySelector('.skip-link');
    const target = document.querySelector('#main');

    // Mock scrollIntoView if it doesn't exist
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = jest.fn();
    }
    const scrollSpy = jest.spyOn(target, 'scrollIntoView');

    skipLink.click();

    expect(scrollSpy).toHaveBeenCalled();
  });

  test('setupSkipLink handles missing skip link gracefully', () => {
    document.body.innerHTML = '';
    expect(() => Portfolio.AccessibilityManager.setupSkipLink()).not.toThrow();
  });

  test('setupKeyboardNavigation adds tabindex to project cards', () => {
    Portfolio.AccessibilityManager.setupKeyboardNavigation();
    const cards = document.querySelectorAll('.project-card');

    cards.forEach(card => {
      expect(card.getAttribute('tabindex')).toBe('0');
    });
  });

  test('setupScreenReaderAnnouncements creates announcer div', () => {
    Portfolio.AccessibilityManager.setupScreenReaderAnnouncements();
    const announcer = document.querySelector('[aria-live="polite"]');

    expect(announcer).toBeTruthy();
    expect(announcer.getAttribute('aria-atomic')).toBe('true');
  });

  test('setupScreenReaderAnnouncements announces navigation', () => {
    Portfolio.AccessibilityManager.setupScreenReaderAnnouncements();
    const announcer = document.querySelector('[aria-live="polite"]');
    const navLink = document.querySelector('.nav-link');

    navLink.click();

    expect(announcer.textContent).toContain('Home');
  });
});

describe('ProjectInteractions', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="project-card">Project 1</div>
      <div class="project-card">Project 2</div>
    `;
  });

  test('setup adds hover interactions to project cards', () => {
    Portfolio.ProjectInteractions.setup();
    const card = document.querySelector('.project-card');

    const mouseEnter = new Event('mouseenter');
    card.dispatchEvent(mouseEnter);
    expect(card.style.transform).toBe('translateY(-10px)');

    const mouseLeave = new Event('mouseleave');
    card.dispatchEvent(mouseLeave);
    expect(card.style.transform).toMatch(/translateY\(0(px)?\)/);
  });
});

describe('ContactInteractions', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <a href="mailto:test@test.com" class="contact-link">Email</a>
      <a href="tel:1234567890" class="contact-link">Phone</a>
      <a href="#" class="contact-link">Other</a>
    `;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('setup adds click animations to contact links', () => {
    Portfolio.ContactInteractions.setup();
    const link = document.querySelector('.contact-link');

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    link.click();

    expect(link.style.transform).toBe('scale(0.95)');
    expect(consoleSpy).toHaveBeenCalledWith('Email link clicked');

    jest.advanceTimersByTime(100);
    expect(link.style.transform).toBe('scale(1)');

    consoleSpy.mockRestore();
  });

  test('setup logs phone clicks correctly', () => {
    Portfolio.ContactInteractions.setup();
    const phoneLink = document.querySelectorAll('.contact-link')[1];
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    phoneLink.click();

    expect(consoleSpy).toHaveBeenCalledWith('Phone link clicked');
    consoleSpy.mockRestore();
  });

  test('setup handles links without mailto or tel', () => {
    Portfolio.ContactInteractions.setup();
    const otherLink = document.querySelectorAll('.contact-link')[2];
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    otherLink.click();

    expect(consoleSpy).not.toHaveBeenCalledWith('Email link clicked');
    expect(consoleSpy).not.toHaveBeenCalledWith('Phone link clicked');
    consoleSpy.mockRestore();
  });
});

describe('ErrorHandler', () => {
  test('setup adds error event listeners', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    Portfolio.ErrorHandler.setup();

    expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));

    addEventListenerSpy.mockRestore();
  });
});

describe('BrowserSupport', () => {
  test('check warns about missing IntersectionObserver', () => {
    const originalIO = window.IntersectionObserver;
    delete window.IntersectionObserver;

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    Portfolio.BrowserSupport.check();

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('IntersectionObserver not supported'));

    consoleWarnSpy.mockRestore();
    window.IntersectionObserver = originalIO;
  });

  test('check applies fallback for missing IntersectionObserver', () => {
    const originalIO = window.IntersectionObserver;
    delete window.IntersectionObserver;

    document.body.innerHTML = '<div class="animate-on-scroll"></div>';

    jest.spyOn(console, 'warn').mockImplementation();
    Portfolio.BrowserSupport.check();

    const element = document.querySelector('.animate-on-scroll');
    expect(element.classList.contains('animate')).toBe(true);

    window.IntersectionObserver = originalIO;
  });
});

describe('ScrollAnimations', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="profile-card">Profile</div>
      <div class="skill-item">Skill</div>
      <div class="timeline-item">Timeline</div>
      <div class="project-card">Project</div>
      <div class="contact-link">Contact</div>
    `;
  });

  test('setup adds animate-on-scroll class to elements', () => {
    Portfolio.ScrollAnimations.setup();

    expect(document.querySelector('.profile-card').classList.contains('animate-on-scroll')).toBe(true);
    expect(document.querySelector('.skill-item').classList.contains('animate-on-scroll')).toBe(true);
    expect(document.querySelector('.timeline-item').classList.contains('animate-on-scroll')).toBe(true);
    expect(document.querySelector('.project-card').classList.contains('animate-on-scroll')).toBe(true);
    expect(document.querySelector('.contact-link').classList.contains('animate-on-scroll')).toBe(true);
  });

  test('setup triggers animation on intersection', (done) => {
    Portfolio.ScrollAnimations.setup();

    setTimeout(() => {
      const profileCard = document.querySelector('.profile-card');
      expect(profileCard.classList.contains('animate')).toBe(true);
      done();
    }, 10);
  });
});

describe('EventDelegator', () => {
  beforeEach(() => {
    // Reset EventDelegator to allow re-initialization in each test
    Portfolio.EventDelegator.reset();
  });

  test('init handles theme toggle clicks', () => {
    document.body.innerHTML = '<button class="theme-toggle"><span class="theme-icon">🌙</span></button>';
    Portfolio.EventDelegator.init();

    const button = document.querySelector('.theme-toggle');
    const initialTheme = Portfolio.ThemeManager.getCurrentTheme();

    button.click();

    const newTheme = Portfolio.ThemeManager.getCurrentTheme();
    expect(newTheme).not.toBe(initialTheme);
  });

  test('init handles project card clicks', () => {
    document.body.innerHTML = '<div class="project-card">Project</div>';
    Portfolio.EventDelegator.init();

    const card = document.querySelector('.project-card');
    card.click();

    expect(card.classList.contains('flipped')).toBe(true);

    card.click();
    expect(card.classList.contains('flipped')).toBe(false);
  });

  test('init handles keyboard navigation for project cards', () => {
    document.body.innerHTML = '<div class="project-card">Project</div>';
    Portfolio.EventDelegator.init();

    const card = document.querySelector('.project-card');
    card.tabIndex = 0;
    card.focus();

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    Object.defineProperty(enterEvent, 'target', { value: card, enumerable: true });
    card.dispatchEvent(enterEvent);

    expect(card.classList.contains('flipped')).toBe(true);
  });

  test('init handles Space key for project cards', () => {
    document.body.innerHTML = '<div class="project-card">Project</div>';
    Portfolio.EventDelegator.init();

    const card = document.querySelector('.project-card');
    card.tabIndex = 0;
    card.focus();

    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    Object.defineProperty(spaceEvent, 'target', { value: card, enumerable: true });
    card.dispatchEvent(spaceEvent);

    expect(card.classList.contains('flipped')).toBe(true);
  });

  test('init ignores other keys for project cards', () => {
    document.body.innerHTML = '<div class="project-card">Project</div>';
    Portfolio.EventDelegator.init();

    const card = document.querySelector('.project-card');

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    card.dispatchEvent(tabEvent);

    expect(card.classList.contains('flipped')).toBe(false);
  });
});

describe('ErrorHandler', () => {
  test('setup registers window error handler', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    Portfolio.ErrorHandler.setup();

    const error = new Error('Test error');
    window.dispatchEvent(new ErrorEvent('error', { error }));

    expect(consoleErrorSpy).toHaveBeenCalledWith('Portfolio error:', error);
    consoleErrorSpy.mockRestore();
  });

  test('setup registers unhandledrejection handler', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    Portfolio.ErrorHandler.setup();

    const reason = new Error('Promise rejection');
    const event = new Event('unhandledrejection');
    Object.defineProperty(event, 'reason', { value: reason });
    window.dispatchEvent(event);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Unhandled promise rejection:', reason);
    consoleErrorSpy.mockRestore();
  });
});

describe('BrowserSupport', () => {
  test('check handles missing IntersectionObserver', () => {
    const originalIO = global.IntersectionObserver;
    delete global.IntersectionObserver;

    document.body.innerHTML = '<div class="animate-on-scroll"></div>';
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    Portfolio.BrowserSupport.check();

    const element = document.querySelector('.animate-on-scroll');
    expect(element.classList.contains('animate')).toBe(true);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('IntersectionObserver not supported'));

    global.IntersectionObserver = originalIO;
    consoleWarnSpy.mockRestore();
  });

  test('check does nothing when IntersectionObserver is supported', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    Portfolio.BrowserSupport.check();

    expect(consoleWarnSpy).not.toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });
});

describe('ContactInteractions', () => {
  test('setup handles mailto link clicks', () => {
    jest.useFakeTimers();
    document.body.innerHTML = '<a href="mailto:test@example.com" class="contact-link">Email</a>';

    Portfolio.ContactInteractions.setup();

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const link = document.querySelector('.contact-link');

    link.click();

    expect(consoleLogSpy).toHaveBeenCalledWith('Email link clicked');

    jest.advanceTimersByTime(100);
    consoleLogSpy.mockRestore();
    jest.useRealTimers();
  });

  test('setup handles tel link clicks', () => {
    jest.useFakeTimers();
    document.body.innerHTML = '<a href="tel:+1234567890" class="contact-link">Call</a>';

    Portfolio.ContactInteractions.setup();

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const link = document.querySelector('.contact-link');

    link.click();

    expect(consoleLogSpy).toHaveBeenCalledWith('Phone link clicked');

    jest.advanceTimersByTime(100);
    consoleLogSpy.mockRestore();
    jest.useRealTimers();
  });
});

describe('NavigationManager additional tests', () => {
  test('setupSmoothScrolling handles missing target section', () => {
    Portfolio.NavigationManager.setupSmoothScrolling();
    document.body.innerHTML = '<a href="#nonexistent">Link</a>';

    const link = document.querySelector('a[href="#nonexistent"]');
    const scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation();

    link.click();

    expect(scrollSpy).not.toHaveBeenCalled();
    scrollSpy.mockRestore();
  });

  test('setupSmoothScrolling handles empty href', () => {
    Portfolio.NavigationManager.setupSmoothScrolling();
    document.body.innerHTML = '<a href="#">Link</a>';

    const link = document.querySelector('a[href="#"]');
    const scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation();

    link.click();

    expect(scrollSpy).not.toHaveBeenCalled();
    scrollSpy.mockRestore();
  });
});

describe('PortfolioApp', () => {
  test('init initializes without errors', () => {
    document.body.innerHTML = '<div class="navbar"></div>';
    const consoleErrorSpy = jest.spyOn(console, 'error');

    Portfolio.PortfolioApp.init();

    expect(consoleErrorSpy).not.toHaveBeenCalledWith(expect.stringContaining('Failed to initialize'));
    consoleErrorSpy.mockRestore();
  });

  test('init handles errors gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Force an error by making ThemeManager.initTheme throw
    const originalInit = Portfolio.ThemeManager.initTheme;
    Portfolio.ThemeManager.initTheme = () => { throw new Error('Test error'); };

    Portfolio.PortfolioApp.init();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to initialize portfolio:', expect.any(Error));

    Portfolio.ThemeManager.initTheme = originalInit;
    consoleErrorSpy.mockRestore();
  });
});
