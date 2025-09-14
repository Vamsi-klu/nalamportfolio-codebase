# Overview

Modern Portfolio Website for Ramachandra Nalam, a Data Engineer with 7+ years of experience specializing in real-time analytics and data pipelines. The portfolio features a single-page modern interface with interactive flash card projects, professional profile image integration, and dark/light theme toggle functionality. Built with vanilla JavaScript for maximum compatibility and performance.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Modern Single-Page Design**: The portfolio implements a cohesive modern user experience featuring:
- **Interactive Flash Cards**: Project showcase with 3D flip animations revealing detailed information on click
- **Professional Profile Image**: LinkedIn profile image integration with hover effects and responsive design
- **Dark/Light Theme Toggle**: Persistent theme switching with smooth CSS variable transitions and localStorage persistence
- **Experience Timeline**: Modern grid layout with professional timeline styling and staggered animations

**Vanilla JavaScript Implementation**: No frameworks used - pure JavaScript for DOM manipulation, animations, and user interactions. This choice ensures fast loading times, minimal dependencies, and maximum browser compatibility.

**Component Structure**: Modular approach with separate CSS and JS files for each interface, shared utilities for common functionality like resume requests and logging.

**Responsive Design**: Mobile-first approach with hamburger navigation, flexible layouts, and touch-friendly interactions across both interfaces.

## Data Management

**Static JSON Data Storage**: Profile information and project data stored in structured JSON files (`profile.json`, `projects.json`). This approach enables easy content updates without database dependencies while maintaining fast load times.

**Client-side State Management**: Browser localStorage used for user preferences (themes, command history) and local event logging. Session data persists across browser visits.

**Event Tracking System**: Custom analytics implementation with local storage backup and optional remote logging endpoints for user interaction tracking.

## Server Architecture

**Simple HTTP Server**: Python-based static file server (`server.py`) with custom routing logic for dual interface support. Handles MIME types properly and includes cache control headers for development.

**Serverless Functions**: Optional resume request handling through multiple deployment targets:
- Netlify Functions (`netlify/functions/resume-request.js`)
- Vercel API Routes (`api/resume-request.js`)

**Static File Serving**: All assets served statically with proper caching strategies and mobile optimization.

# External Dependencies

## Required Services
- **Font Loading**: Google Fonts API for Inter font family
- **Email Services** (Optional): Resend API for resume request notifications
- **Database Services** (Optional): Supabase REST API for storing resume requests and analytics data

## Optional Integrations
- **Analytics**: Custom event tracking with configurable remote endpoints
- **Contact Forms**: Resume request system with email notifications and database storage
- **Theme System**: Persistent user preference storage using browser localStorage

## Development Tools
- **Python HTTP Server**: Built-in development server for local testing
- **Environment Variables**: Support for API keys and service configuration across deployment platforms
- **CORS Handling**: Proper cross-origin request support for serverless functions

## Browser APIs
- **Local Storage**: User preferences and offline functionality
- **Intersection Observer**: Smooth scroll animations and navigation highlighting  
- **Canvas API**: Particle effects and Matrix rain animations in terminal interface
- **Web Audio API**: Sound effects for terminal interactions