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
}

global.IntersectionObserver = IntersectionObserverMock;

const Portfolio = require('../main.js');

describe('ThemeManager', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
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
    expect(() => Portfolio.ThemeManager.setTheme('invalid')).toThrow('Invalid theme: invalid');
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
    window.scrollY = 0;
  });

  test('updateNavbar applies light theme styles when not scrolled', () => {
    Portfolio.ThemeManager.setTheme('light');
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
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    Portfolio.ThemeManager.setTheme('light');
    Portfolio.NavbarManager.updateNavbar();
    const navbar = document.querySelector('.navbar');
    expect(navbar.style.background).toBe('rgba(255, 255, 255, 0.98)');
    expect(navbar.style.boxShadow).toBe('0 2px 20px rgba(0, 0, 0, 0.1)');
  });

  test('updateNavbar handles missing navbar gracefully', () => {
    document.body.innerHTML = '';
    expect(() => Portfolio.NavbarManager.updateNavbar()).not.toThrow();
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
  });

  afterEach(() => {
    Portfolio.TypingAnimation.stop();
  });

  test('setup initializes typing animation', () => {
    Portfolio.TypingAnimation.setup();
    expect(Portfolio.TypingAnimation.element).toBeTruthy();
  });

  test('setup handles missing element gracefully', () => {
    document.body.innerHTML = '';
    expect(() => Portfolio.TypingAnimation.setup()).not.toThrow();
  });

  test('type updates element textContent', () => {
    Portfolio.TypingAnimation.setup();
    Portfolio.TypingAnimation.type();
    const text = document.querySelector('.typing-text').textContent;
    expect(text.length).toBeGreaterThan(0);
  });

  test('stop clears timeout', () => {
    Portfolio.TypingAnimation.state.timeoutId = setTimeout(() => {}, 1000);
    Portfolio.TypingAnimation.stop();
    expect(Portfolio.TypingAnimation.state.timeoutId).toBeNull();
  });

  test('typing cycles through roles', (done) => {
    Portfolio.TypingAnimation.setup();
    const initialRole = Portfolio.TypingAnimation.state.currentRole;

    // Fast forward through multiple cycles
    setTimeout(() => {
      expect(Portfolio.TypingAnimation.element.textContent.length).toBeGreaterThan(0);
      done();
    }, 100);
  });
});

describe('Utils', () => {
  test('debounce delays function execution', (done) => {
    let counter = 0;
    const debouncedFn = Portfolio.Utils.debounce(() => { counter++; }, 50);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(counter).toBe(0);

    setTimeout(() => {
      expect(counter).toBe(1);
      done();
    }, 100);
  });

  test('debounce passes arguments correctly', (done) => {
    let result = null;
    const debouncedFn = Portfolio.Utils.debounce((a, b) => { result = a + b; }, 50);

    debouncedFn(5, 10);

    setTimeout(() => {
      expect(result).toBe(15);
      done();
    }, 100);
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

  test('setupSmoothScrolling handles anchor clicks', () => {
    Portfolio.NavigationManager.setupSmoothScrolling();
    const link = document.querySelector('a[href="#home"]');
    const scrollSpy = jest.spyOn(window, 'scrollTo');

    const event = new Event('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);

    expect(scrollSpy).toHaveBeenCalled();
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
    const scrollSpy = jest.spyOn(Element.prototype, 'scrollIntoView');

    skipLink.click();

    expect(scrollSpy).toHaveBeenCalled();
    scrollSpy.mockRestore();
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
    expect(card.style.transform).toBe('translateY(0px)');
  });
});

describe('ContactInteractions', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <a href="mailto:test@test.com" class="contact-link">Email</a>
      <a href="tel:1234567890" class="contact-link">Phone</a>
      <a href="#" class="contact-link">Other</a>
    `;
  });

  test('setup adds click animations to contact links', (done) => {
    Portfolio.ContactInteractions.setup();
    const link = document.querySelector('.contact-link');

    const consoleSpy = jest.spyOn(console, 'log');
    link.click();

    expect(link.style.transform).toBe('scale(0.95)');
    expect(consoleSpy).toHaveBeenCalledWith('Email link clicked');

    setTimeout(() => {
      expect(link.style.transform).toBe('scale(1)');
      consoleSpy.mockRestore();
      done();
    }, 150);
  });

  test('setup logs phone clicks correctly', () => {
    Portfolio.ContactInteractions.setup();
    const phoneLink = document.querySelectorAll('.contact-link')[1];
    const consoleSpy = jest.spyOn(console, 'log');

    phoneLink.click();

    expect(consoleSpy).toHaveBeenCalledWith('Phone link clicked');
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
});

describe('EventDelegator', () => {
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

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    card.dispatchEvent(enterEvent);

    expect(card.classList.contains('flipped')).toBe(true);
  });

  test('init handles Space key for project cards', () => {
    document.body.innerHTML = '<div class="project-card">Project</div>';
    Portfolio.EventDelegator.init();

    const card = document.querySelector('.project-card');

    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    card.dispatchEvent(spaceEvent);

    expect(card.classList.contains('flipped')).toBe(true);
  });
});

describe('PortfolioApp', () => {
  test('init initializes without errors', () => {
    document.body.innerHTML = '<div class="navbar"></div>';
    const consoleErrorSpy = jest.spyOn(console, 'error');

    Portfolio.PortfolioApp.init();

    expect(consoleErrorSpy).not.toHaveBeenCalled();
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
