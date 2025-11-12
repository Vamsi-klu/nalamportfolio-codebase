/* Modern Portfolio JavaScript - Refactored for better testability and maintainability */
(function() {
    'use strict';

    // ========== Theme Manager Module ==========
    const ThemeManager = {
        THEMES: { LIGHT: 'light', DARK: 'dark' },
        STORAGE_KEY: 'theme',

        getCurrentTheme() {
            return document.documentElement.getAttribute('data-theme') || this.THEMES.LIGHT;
        },

        setTheme(theme) {
            if (theme !== this.THEMES.LIGHT && theme !== this.THEMES.DARK) {
                throw new Error(`Invalid theme: ${theme}`);
            }
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem(this.STORAGE_KEY, theme);
            this.updateThemeIcon(theme);
            this.dispatchThemeChange(theme);
        },

        toggleTheme() {
            const currentTheme = this.getCurrentTheme();
            const newTheme = currentTheme === this.THEMES.DARK ? this.THEMES.LIGHT : this.THEMES.DARK;
            this.setTheme(newTheme);
            return newTheme;
        },

        initTheme() {
            const savedTheme = localStorage.getItem(this.STORAGE_KEY) || this.THEMES.LIGHT;
            this.setTheme(savedTheme);
        },

        updateThemeIcon(theme) {
            const themeIcon = document.querySelector('.theme-icon');
            if (themeIcon) {
                themeIcon.textContent = theme === this.THEMES.DARK ? '☀️' : '🌙';
            }
        },

        dispatchThemeChange(theme) {
            window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
        }
    };

    // ========== Navbar Manager Module ==========
    const NavbarManager = {
        SCROLL_THRESHOLD: 50,

        THEME_STYLES: {
            dark: {
                scrolled: { background: 'rgba(17, 24, 39, 0.98)', borderColor: '#4b5563', shadow: '0 2px 20px rgba(0, 0, 0, 0.4)' },
                default: { background: 'rgba(17, 24, 39, 0.95)', borderColor: '#4b5563', shadow: 'none' }
            },
            light: {
                scrolled: { background: 'rgba(255, 255, 255, 0.98)', borderColor: '#e5e7eb', shadow: '0 2px 20px rgba(0, 0, 0, 0.1)' },
                default: { background: 'rgba(255, 255, 255, 0.95)', borderColor: '#e5e7eb', shadow: 'none' }
            }
        },

        updateNavbar() {
            const navbar = document.querySelector('.navbar');
            if (!navbar) return;

            const theme = ThemeManager.getCurrentTheme();
            const scrolled = window.scrollY > this.SCROLL_THRESHOLD;
            const styles = this.THEME_STYLES[theme][scrolled ? 'scrolled' : 'default'];

            navbar.style.background = styles.background;
            navbar.style.borderBottomColor = styles.borderColor;
            navbar.style.boxShadow = styles.shadow;
        },

        setupScrollListener() {
            window.addEventListener('scroll', () => this.updateNavbar(), { passive: true });
            this.updateNavbar(); // Initial call
        },

        setupThemeListener() {
            window.addEventListener('themechange', () => this.updateNavbar());
        },

        init() {
            this.setupScrollListener();
            this.setupThemeListener();
        }
    };

    // ========== Event Delegation Manager ==========
    const EventDelegator = {
        _initialized: false,
        _listeners: [],

        init() {
            if (this._initialized) return;
            this._initialized = true;

            // Theme toggle
            const themeClickHandler = (e) => {
                if (e.target.closest('.theme-toggle')) {
                    ThemeManager.toggleTheme();
                }
            };
            document.addEventListener('click', themeClickHandler);
            this._listeners.push({ type: 'click', handler: themeClickHandler });

            // Project card flip
            const cardClickHandler = (e) => {
                const card = e.target.closest('.project-card');
                if (card) {
                    card.classList.toggle('flipped');
                }
            };
            document.addEventListener('click', cardClickHandler);
            this._listeners.push({ type: 'click', handler: cardClickHandler });

            // Keyboard support for project cards
            const cardKeyHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    const card = e.target.closest('.project-card');
                    if (card) {
                        e.preventDefault();
                        card.classList.toggle('flipped');
                    }
                }
            };
            document.addEventListener('keydown', cardKeyHandler);
            this._listeners.push({ type: 'keydown', handler: cardKeyHandler });
        },

        reset() {
            // Remove all event listeners
            this._listeners.forEach(({ type, handler }) => {
                document.removeEventListener(type, handler);
            });
            this._listeners = [];
            this._initialized = false;
        }
    };

    // ========== Navigation Module ==========
    const NavigationManager = {
        setupMobileMenu() {
            const hamburger = document.querySelector('.hamburger');
            const navMenu = document.querySelector('.nav-menu');

            if (!hamburger || !navMenu) return;

            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close mobile menu when clicking on links
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        },

        setupActiveLink() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-link');

            if (sections.length === 0 || navLinks.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        navLinks.forEach(link => {
                            link.classList.remove('active');
                            if (link.getAttribute('href') === `#${id}`) {
                                link.classList.add('active');
                            }
                        });
                    }
                });
            }, {
                rootMargin: '-50% 0px -50% 0px',
                threshold: 0
            });

            sections.forEach(section => observer.observe(section));
        },

        setupSmoothScrolling() {
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href^="#"]');
                if (!link) return;

                const targetId = link.getAttribute('href');
                // Don't process empty or just "#" hrefs
                if (!targetId || targetId === '#') return;

                e.preventDefault();
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        },

        init() {
            this.setupMobileMenu();
            this.setupActiveLink();
            this.setupSmoothScrolling();
        }
    };

    // ========== Typing Animation Module ==========
    const TypingAnimation = {
        roles: [
            'Data Engineer',
            'Analytics Engineer',
            'Big Data Specialist',
            'ML Engineer',
            'Data Scientist'
        ],

        state: {
            currentRole: 0,
            currentChar: 0,
            isDeleting: false,
            timeoutId: null
        },

        setup() {
            const typingElement = document.querySelector('.typing-text');
            if (!typingElement) return;

            this.element = typingElement;
            this.type();
        },

        type() {
            const current = this.roles[this.state.currentRole];

            if (this.state.isDeleting) {
                this.element.textContent = current.substring(0, this.state.currentChar - 1);
                this.state.currentChar--;
            } else {
                this.element.textContent = current.substring(0, this.state.currentChar + 1);
                this.state.currentChar++;
            }

            let typeSpeed = this.state.isDeleting ? 50 : 100;

            if (!this.state.isDeleting && this.state.currentChar === current.length) {
                typeSpeed = 2000;
                this.state.isDeleting = true;
            } else if (this.state.isDeleting && this.state.currentChar === 0) {
                this.state.isDeleting = false;
                this.state.currentRole = (this.state.currentRole + 1) % this.roles.length;
                typeSpeed = 500;
            }

            this.state.timeoutId = setTimeout(() => this.type(), typeSpeed);
        },

        stop() {
            if (this.state.timeoutId) {
                clearTimeout(this.state.timeoutId);
                this.state.timeoutId = null;
            }
        }
    };

    // ========== Scroll Animations Module ==========
    const ScrollAnimations = {
        setup() {
            const elementsToAnimate = [
                '.profile-card',
                '.skill-item',
                '.timeline-item',
                '.project-card',
                '.contact-link'
            ];

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            elementsToAnimate.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.classList.add('animate-on-scroll');
                    observer.observe(element);
                });
            });
        }
    };

    // ========== Accessibility Module ==========
    const AccessibilityManager = {
        setupSkipLink() {
            const skipLink = document.querySelector('.skip-link');
            if (!skipLink) return;

            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(skipLink.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        },

        setupKeyboardNavigation() {
            const projectCards = document.querySelectorAll('.project-card');
            projectCards.forEach(card => {
                card.setAttribute('tabindex', '0');
            });
        },

        setupScreenReaderAnnouncements() {
            const announcer = document.createElement('div');
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
            document.body.appendChild(announcer);

            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    const targetId = link.getAttribute('href').substring(1);
                    const sectionName = targetId.charAt(0).toUpperCase() + targetId.slice(1);
                    announcer.textContent = `Navigated to ${sectionName} section`;
                });
            });
        },

        init() {
            this.setupSkipLink();
            this.setupKeyboardNavigation();
            this.setupScreenReaderAnnouncements();
        }
    };

    // ========== Project Interactions Module ==========
    const ProjectInteractions = {
        setup() {
            const projectCards = document.querySelectorAll('.project-card');

            projectCards.forEach(card => {
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-10px)';
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0)';
                });
            });
        }
    };

    // ========== Contact Interactions Module ==========
    const ContactInteractions = {
        setup() {
            const contactLinks = document.querySelectorAll('.contact-link');

            contactLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    link.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        link.style.transform = 'scale(1)';
                    }, 100);

                    const href = link.getAttribute('href');
                    if (href && href.startsWith('mailto:')) {
                        console.log('Email link clicked');
                    } else if (href && href.startsWith('tel:')) {
                        console.log('Phone link clicked');
                    }
                });
            });
        }
    };

    // ========== Error Handling ==========
    const ErrorHandler = {
        setup() {
            window.addEventListener('error', (e) => {
                console.error('Portfolio error:', e.error);
            });

            window.addEventListener('unhandledrejection', (e) => {
                console.error('Unhandled promise rejection:', e.reason);
            });
        }
    };

    // ========== Browser Support Check ==========
    const BrowserSupport = {
        check() {
            if (!('IntersectionObserver' in window)) {
                console.warn('IntersectionObserver not supported. Applying fallback...');
                const animatedElements = document.querySelectorAll('.animate-on-scroll');
                animatedElements.forEach(element => {
                    element.classList.add('animate');
                });
            }
        }
    };

    // ========== Utility Functions ==========
    const Utils = {
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };

    // ========== Main Portfolio Application ==========
    const PortfolioApp = {
        init() {
            try {
                BrowserSupport.check();
                ThemeManager.initTheme();
                NavbarManager.init();
                EventDelegator.init();
                NavigationManager.init();
                TypingAnimation.setup();
                ScrollAnimations.setup();
                AccessibilityManager.init();
                ProjectInteractions.setup();
                ContactInteractions.setup();
                ErrorHandler.setup();
            } catch (error) {
                console.error('Failed to initialize portfolio:', error);
            }
        }
    };

    // ========== Export for Testing ==========
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            ThemeManager,
            NavbarManager,
            EventDelegator,
            NavigationManager,
            TypingAnimation,
            ScrollAnimations,
            AccessibilityManager,
            ProjectInteractions,
            ContactInteractions,
            ErrorHandler,
            BrowserSupport,
            Utils,
            PortfolioApp
        };
    } else {
        // ========== Initialize on DOM Ready (only in browser) ==========
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => PortfolioApp.init());
        } else {
            PortfolioApp.init();
        }

        // Global API for backward compatibility and debugging
        window.Portfolio = {
            ThemeManager,
            NavbarManager,
            Utils
        };
    }

})();
