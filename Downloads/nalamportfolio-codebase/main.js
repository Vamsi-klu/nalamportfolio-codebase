/* Modern Portfolio JavaScript */
(function() {
    'use strict';

    // DOM Elements
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const skillProgressBars = document.querySelectorAll('.skill-progress');
    
    // Flash Card Function (global scope for onclick)
    window.flipCard = function(card) {
        card.classList.toggle('flipped');
    };
    
    // Theme Toggle Function (global scope for onclick)
    window.toggleTheme = function() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme icon
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
        
        // Update navbar background for theme
        updateNavbarTheme(newTheme);
        
        console.log('Theme toggled to:', newTheme);
    };
    
    // Initialize theme on page load
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }
        
        // Update navbar background for theme
        updateNavbarTheme(savedTheme);
    }
    
    // Update navbar theme (respects scroll state)
    function updateNavbarTheme(theme) {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        const scrolled = window.scrollY > 50;
        if (theme === 'dark') {
            navbar.style.background = scrolled ? 'rgba(17, 24, 39, 0.98)' : 'rgba(17, 24, 39, 0.95)';
            navbar.style.borderBottomColor = '#4b5563';
            navbar.style.boxShadow = scrolled ? '0 2px 20px rgba(0, 0, 0, 0.4)' : 'none';
        } else {
            navbar.style.background = scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)';
            navbar.style.borderBottomColor = '#e5e7eb';
            navbar.style.boxShadow = scrolled ? '0 2px 20px rgba(0, 0, 0, 0.1)' : 'none';
        }
    }
    
    // Initialize the portfolio
    function init() {
        initTheme();
        setupNavigation();
        setupSkillAnimations();
        setupTypingAnimation();
        setupScrollAnimations();
        setupSmoothScrolling();
    }

    // Navigation functionality
    function setupNavigation() {
        // Mobile menu toggle
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking on links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Active nav link highlighting
        setupActiveNavLink();
    }

    // Active navigation link based on scroll position
    function setupActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
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

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // Skill bar animations
    function setupSkillAnimations() {
        const skillsSection = document.querySelector('#skills');
        if (!skillsSection) return;

        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSkillBars();
                    skillObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });

        skillObserver.observe(skillsSection);
    }

    function animateSkillBars() {
        // Skills no longer have progress bars - this function is disabled
        return;
    }

    // Typing animation for hero section
    function setupTypingAnimation() {
        const typingElement = document.querySelector('.typing-text');
        if (!typingElement) return;

        const roles = [
            'Data Engineer',
            'Analytics Engineer', 
            'Big Data Specialist',
            'ML Engineer',
            'Data Scientist'
        ];

        let currentRole = 0;
        let currentChar = 0;
        let isDeleting = false;

        function typeRole() {
            const current = roles[currentRole];
            
            if (isDeleting) {
                typingElement.textContent = current.substring(0, currentChar - 1);
                currentChar--;
            } else {
                typingElement.textContent = current.substring(0, currentChar + 1);
                currentChar++;
            }

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && currentChar === current.length) {
                typeSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && currentChar === 0) {
                isDeleting = false;
                currentRole = (currentRole + 1) % roles.length;
                typeSpeed = 500; // Pause before next word
            }

            setTimeout(typeRole, typeSpeed);
        }

        typeRole();
    }

    // Scroll animations for elements
    function setupScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(element => {
            scrollObserver.observe(element);
        });

        // Add animate-on-scroll class to various elements
        const elementsToAnimate = [
            '.profile-card',
            '.skill-item',
            '.timeline-item',
            '.project-card',
            '.contact-link'
        ];

        elementsToAnimate.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.classList.add('animate-on-scroll');
                scrollObserver.observe(element);
            });
        });
    }

    // Smooth scrolling for navigation links
    function setupSmoothScrolling() {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70; // Account for navbar height
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Smooth scrolling for hero buttons
        const heroButtons = document.querySelectorAll('.hero-buttons a[href^="#"]');
        heroButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = button.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Navbar background on scroll (theme-aware)
    function setupNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        const apply = () => {
            const theme = document.documentElement.getAttribute('data-theme') || 'light';
            updateNavbarTheme(theme);
        };

        window.addEventListener('scroll', apply);
        // Apply once on init in case the page loads scrolled
        apply();
    }

    // Project card interactions
    function setupProjectInteractions() {
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

    // Contact link interactions
    function setupContactInteractions() {
        const contactLinks = document.querySelectorAll('.contact-link');
        
        contactLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Add click animation
                link.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    link.style.transform = 'scale(1)';
                }, 100);
                
                // Handle email and phone links
                const href = link.getAttribute('href');
                if (href.startsWith('mailto:')) {
                    // Track email click
                    console.log('Email link clicked');
                } else if (href.startsWith('tel:')) {
                    // Track phone click
                    console.log('Phone link clicked');
                }
            });
        });
    }

    // Intersection Observer polyfill for older browsers
    function checkBrowserSupport() {
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported. Loading polyfill...');
            // Fallback: add animate class immediately to all elements
            const animatedElements = document.querySelectorAll('.animate-on-scroll');
            animatedElements.forEach(element => {
                element.classList.add('animate');
            });
            
            // Animate skill bars immediately
            setTimeout(animateSkillBars, 1000);
        }
    }

    // Utility function to debounce scroll events
    function debounce(func, wait) {
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

    // Performance optimizations
    function setupPerformanceOptimizations() {
        // Lazy load animations
        const debouncedScroll = debounce(() => {
            // Additional scroll-based optimizations can go here
        }, 16);

        window.addEventListener('scroll', debouncedScroll, { passive: true });
        
        // Preload critical images
        const criticalImages = document.querySelectorAll('img[data-critical]');
        criticalImages.forEach(img => {
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
            }
        });
    }

    // Error handling
    function setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Portfolio error:', e.error);
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });
    }

    // Accessibility enhancements
    function setupAccessibility() {
        // Skip link functionality
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(skipLink.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Keyboard navigation for project cards
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    card.click();
                }
            });
        });

        // Announce page changes for screen readers
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.position = 'absolute';
        announcer.style.left = '-10000px';
        announcer.style.width = '1px';
        announcer.style.height = '1px';
        announcer.style.overflow = 'hidden';
        document.body.appendChild(announcer);

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                const targetId = link.getAttribute('href').substring(1);
                const sectionName = targetId.charAt(0).toUpperCase() + targetId.slice(1);
                announcer.textContent = `Navigated to ${sectionName} section`;
            });
        });
    }

    // Initialize everything when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            checkBrowserSupport();
            init();
            setupNavbarScroll();
            setupProjectInteractions();
            setupContactInteractions();
            setupPerformanceOptimizations();
            setupErrorHandling();
            setupAccessibility();
        });
    } else {
        checkBrowserSupport();
        init();
        setupNavbarScroll();
        setupProjectInteractions();
        setupContactInteractions();
        setupPerformanceOptimizations();
        setupErrorHandling();
        setupAccessibility();
    }

    // Expose some functions globally for debugging
    window.PortfolioDebug = {
        animateSkillBars,
        setupSkillAnimations,
        setupTypingAnimation
    };

})();
