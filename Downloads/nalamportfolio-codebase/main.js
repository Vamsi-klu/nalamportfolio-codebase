/* Modern Portfolio JavaScript - Refactored for better testability and maintainability */
/* Enhanced with World-Class Features */
(function() {
    'use strict';

    // ========== Preloader Module ==========
    const Preloader = {
        element: null,

        create() {
            const preloader = document.createElement('div');
            preloader.id = 'preloader';
            preloader.innerHTML = `
                <div class="preloader-content">
                    <div class="preloader-logo">
                        <span class="preloader-letter">R</span>
                        <span class="preloader-letter">N</span>
                    </div>
                    <div class="preloader-bar">
                        <div class="preloader-progress"></div>
                    </div>
                    <div class="preloader-text">Loading amazing things...</div>
                </div>
            `;
            document.body.prepend(preloader);
            this.element = preloader;
        },

        hide() {
            if (this.element) {
                this.element.classList.add('preloader-hidden');
                setTimeout(() => {
                    if (this.element) {
                        this.element.remove();
                        this.element = null;
                    }
                }, 600);
            }
        },

        init() {
            this.create();
            window.addEventListener('load', () => {
                setTimeout(() => this.hide(), 800);
            });
        }
    };

    // ========== Custom Cursor Module ==========
    const CustomCursor = {
        cursor: null,
        cursorTrail: [],
        trailLength: 8,
        mouseX: 0,
        mouseY: 0,

        create() {
            // Main cursor
            const cursor = document.createElement('div');
            cursor.className = 'custom-cursor';
            cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-ring"></div>';
            document.body.appendChild(cursor);
            this.cursor = cursor;

            // Trail dots
            for (let i = 0; i < this.trailLength; i++) {
                const trail = document.createElement('div');
                trail.className = 'cursor-trail';
                trail.style.opacity = (1 - i / this.trailLength) * 0.5;
                trail.style.transform = `scale(${1 - i / this.trailLength})`;
                document.body.appendChild(trail);
                this.cursorTrail.push({ element: trail, x: 0, y: 0 });
            }
        },

        update(e) {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        },

        animate() {
            if (this.cursor) {
                this.cursor.style.left = this.mouseX + 'px';
                this.cursor.style.top = this.mouseY + 'px';
            }

            let x = this.mouseX;
            let y = this.mouseY;

            this.cursorTrail.forEach((trail, index) => {
                const nextX = x + (trail.x - x) * 0.3;
                const nextY = y + (trail.y - y) * 0.3;
                trail.element.style.left = trail.x + 'px';
                trail.element.style.top = trail.y + 'px';
                trail.x = x;
                trail.y = y;
                x = nextX;
                y = nextY;
            });

            requestAnimationFrame(() => this.animate());
        },

        handleHover(isHovering) {
            if (this.cursor) {
                this.cursor.classList.toggle('cursor-hover', isHovering);
            }
        },

        init() {
            // Only on desktop
            if (window.matchMedia('(pointer: fine)').matches) {
                this.create();
                document.addEventListener('mousemove', (e) => this.update(e));
                this.animate();

                // Hover states
                const interactiveElements = 'a, button, .btn, .project-card, .skill-tag, .contact-link';
                document.addEventListener('mouseover', (e) => {
                    if (e.target.matches(interactiveElements) || e.target.closest(interactiveElements)) {
                        this.handleHover(true);
                    }
                });
                document.addEventListener('mouseout', (e) => {
                    if (e.target.matches(interactiveElements) || e.target.closest(interactiveElements)) {
                        this.handleHover(false);
                    }
                });
            }
        }
    };

    // ========== Particle Background Module ==========
    const ParticleBackground = {
        canvas: null,
        ctx: null,
        particles: [],
        particleCount: 50,
        mouse: { x: null, y: null, radius: 150 },

        create() {
            const canvas = document.createElement('canvas');
            canvas.id = 'particle-canvas';
            const hero = document.querySelector('.hero');
            if (hero) {
                hero.style.position = 'relative';
                hero.prepend(canvas);
                this.canvas = canvas;
                this.ctx = canvas.getContext('2d');
                this.resize();
                this.createParticles();
            }
        },

        resize() {
            if (this.canvas) {
                const hero = document.querySelector('.hero');
                if (hero) {
                    this.canvas.width = hero.offsetWidth;
                    this.canvas.height = hero.offsetHeight;
                }
            }
        },

        createParticles() {
            this.particles = [];
            for (let i = 0; i < this.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    size: Math.random() * 3 + 1,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.5,
                    opacity: Math.random() * 0.5 + 0.2
                });
            }
        },

        animate() {
            if (!this.ctx || !this.canvas) return;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach((particle, index) => {
                // Move particle
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                // Mouse interaction
                if (this.mouse.x && this.mouse.y) {
                    const dx = particle.x - this.mouse.x;
                    const dy = particle.y - this.mouse.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < this.mouse.radius) {
                        const force = (this.mouse.radius - distance) / this.mouse.radius;
                        particle.x += dx * force * 0.02;
                        particle.y += dy * force * 0.02;
                    }
                }

                // Boundary check
                if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;

                // Draw particle
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
                this.ctx.fill();

                // Connect nearby particles
                this.particles.slice(index + 1).forEach(other => {
                    const dx = particle.x - other.x;
                    const dy = particle.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 120) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(particle.x, particle.y);
                        this.ctx.lineTo(other.x, other.y);
                        this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 120)})`;
                        this.ctx.stroke();
                    }
                });
            });

            requestAnimationFrame(() => this.animate());
        },

        init() {
            this.create();
            window.addEventListener('resize', () => {
                this.resize();
                this.createParticles();
            });

            const hero = document.querySelector('.hero');
            if (hero) {
                hero.addEventListener('mousemove', (e) => {
                    const rect = hero.getBoundingClientRect();
                    this.mouse.x = e.clientX - rect.left;
                    this.mouse.y = e.clientY - rect.top;
                });
                hero.addEventListener('mouseleave', () => {
                    this.mouse.x = null;
                    this.mouse.y = null;
                });
            }

            this.animate();
        }
    };

    // ========== Scroll Progress Bar Module ==========
    const ScrollProgress = {
        bar: null,

        create() {
            const bar = document.createElement('div');
            bar.className = 'scroll-progress';
            bar.innerHTML = '<div class="scroll-progress-bar"></div>';
            document.body.prepend(bar);
            this.bar = bar.querySelector('.scroll-progress-bar');
        },

        update() {
            if (this.bar) {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = (scrollTop / docHeight) * 100;
                this.bar.style.width = scrollPercent + '%';
            }
        },

        init() {
            this.create();
            window.addEventListener('scroll', () => this.update(), { passive: true });
        }
    };

    // ========== Back to Top Button Module ==========
    const BackToTop = {
        button: null,

        create() {
            const btn = document.createElement('button');
            btn.className = 'back-to-top';
            btn.innerHTML = '<span class="back-to-top-icon">↑</span><span class="back-to-top-text">TOP</span>';
            btn.setAttribute('aria-label', 'Scroll to top');
            document.body.appendChild(btn);
            this.button = btn;
        },

        update() {
            if (this.button) {
                const show = window.scrollY > 500;
                this.button.classList.toggle('visible', show);
            }
        },

        scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        init() {
            this.create();
            window.addEventListener('scroll', () => this.update(), { passive: true });
            this.button.addEventListener('click', () => this.scrollToTop());
        }
    };

    // ========== Stats Counter Module ==========
    const StatsCounter = {
        counters: [
            { value: 7, suffix: '+', label: 'Years Experience' },
            { value: 50, suffix: 'B+', label: 'Daily Events Processed' },
            { value: 99.9, suffix: '%', label: 'Data Accuracy' },
            { value: 15, suffix: '+', label: 'Dashboards Built' }
        ],

        create() {
            const profileInfo = document.querySelector('.profile-info .container');
            if (!profileInfo) return;

            const statsSection = document.createElement('div');
            statsSection.className = 'stats-grid';
            statsSection.innerHTML = this.counters.map(stat => `
                <div class="stat-item">
                    <div class="stat-number" data-value="${stat.value}" data-suffix="${stat.suffix}">0${stat.suffix}</div>
                    <div class="stat-label">${stat.label}</div>
                </div>
            `).join('');

            profileInfo.appendChild(statsSection);
        },

        animateCounter(element, target, suffix) {
            const duration = 2000;
            const start = performance.now();
            const isFloat = target % 1 !== 0;

            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = target * easeOut;

                element.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        },

        init() {
            this.create();

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const statNumbers = entry.target.querySelectorAll('.stat-number');
                        statNumbers.forEach(el => {
                            const value = parseFloat(el.dataset.value);
                            const suffix = el.dataset.suffix;
                            this.animateCounter(el, value, suffix);
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            const statsGrid = document.querySelector('.stats-grid');
            if (statsGrid) observer.observe(statsGrid);
        }
    };

    // ========== Magnetic Buttons Module ==========
    const MagneticButtons = {
        strength: 30,

        init() {
            const buttons = document.querySelectorAll('.btn, .theme-toggle, .contact-link');

            buttons.forEach(btn => {
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;

                    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
                });

                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'translate(0, 0)';
                });
            });
        }
    };

    // ========== 3D Tilt Effect Module ==========
    const TiltEffect = {
        maxTilt: 15,

        init() {
            const cards = document.querySelectorAll('.project-card, .education-card, .skill-item');

            cards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = (y - centerY) / centerY * -this.maxTilt;
                    const rotateY = (x - centerX) / centerX * this.maxTilt;

                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
                });
            });
        }
    };

    // ========== Text Scramble Animation Module ==========
    const TextScramble = {
        chars: '!<>-_\\/[]{}—=+*^?#________',

        scramble(element, newText) {
            const oldText = element.textContent;
            const length = Math.max(oldText.length, newText.length);
            const duration = 1500;
            const start = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);

                let result = '';
                for (let i = 0; i < length; i++) {
                    if (i < newText.length) {
                        if (progress > i / length) {
                            result += newText[i];
                        } else {
                            result += this.chars[Math.floor(Math.random() * this.chars.length)];
                        }
                    }
                }

                element.textContent = result;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        },

        init() {
            const highlight = document.querySelector('.highlight');
            if (highlight) {
                const originalText = highlight.textContent;
                highlight.textContent = '';
                setTimeout(() => this.scramble(highlight, originalText), 1000);
            }
        }
    };

    // ========== Enhanced Scroll Reveal Module ==========
    const ScrollReveal = {
        init() {
            const revealElements = document.querySelectorAll(
                '.section-title, .about-content p, .timeline-item, .project-card, ' +
                '.education-card, .contact-link, .skill-item, .profile-card'
            );

            revealElements.forEach((el, index) => {
                el.classList.add('reveal');
                el.style.transitionDelay = `${(index % 4) * 0.1}s`;
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

            revealElements.forEach(el => observer.observe(el));
        }
    };

    // ========== Smooth Section Transitions Module ==========
    const SectionTransitions = {
        init() {
            const sections = document.querySelectorAll('section');

            sections.forEach(section => {
                section.classList.add('section-transition');
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('section-visible');
                    }
                });
            }, { threshold: 0.1 });

            sections.forEach(section => observer.observe(section));
        }
    };

    // ========== Easter Egg (Konami Code) Module ==========
    const EasterEgg = {
        code: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
        current: 0,

        activate() {
            document.body.classList.add('party-mode');
            this.createConfetti();

            setTimeout(() => {
                document.body.classList.remove('party-mode');
            }, 5000);
        },

        createConfetti() {
            const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

            for (let i = 0; i < 100; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 2 + 's';
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                document.body.appendChild(confetti);

                setTimeout(() => confetti.remove(), 5000);
            }
        },

        init() {
            document.addEventListener('keydown', (e) => {
                if (e.key === this.code[this.current]) {
                    this.current++;
                    if (this.current === this.code.length) {
                        this.activate();
                        this.current = 0;
                    }
                } else {
                    this.current = 0;
                }
            });
        }
    };

    // ========== Floating Elements Animation ==========
    const FloatingElements = {
        init() {
            const hero = document.querySelector('.hero');
            if (!hero) return;

            const shapes = ['○', '□', '△', '◇', '⬡'];

            for (let i = 0; i < 8; i++) {
                const shape = document.createElement('div');
                shape.className = 'floating-shape';
                shape.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                shape.style.left = Math.random() * 100 + '%';
                shape.style.top = Math.random() * 100 + '%';
                shape.style.animationDelay = Math.random() * 5 + 's';
                shape.style.animationDuration = (Math.random() * 10 + 10) + 's';
                shape.style.fontSize = (Math.random() * 20 + 10) + 'px';
                shape.style.opacity = Math.random() * 0.3 + 0.1;
                hero.appendChild(shape);
            }
        }
    };

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
                // Core features
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

                // World-class enhanced features
                Preloader.init();
                CustomCursor.init();
                ParticleBackground.init();
                ScrollProgress.init();
                BackToTop.init();
                StatsCounter.init();
                MagneticButtons.init();
                TiltEffect.init();
                TextScramble.init();
                ScrollReveal.init();
                SectionTransitions.init();
                FloatingElements.init();
                EasterEgg.init();

                console.log('✨ Portfolio initialized with world-class features!');
                console.log('🎮 Try the Konami Code: ↑↑↓↓←→←→BA');
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
