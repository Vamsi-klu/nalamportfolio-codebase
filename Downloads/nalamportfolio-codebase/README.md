# 🚀 Ramachandra Nalam - Data Engineer Portfolio

A modern, responsive portfolio website showcasing expertise in data engineering, real-time analytics, and machine learning. Built with HTML5, CSS3, and JavaScript, featuring an AI-powered chatbot and dark mode functionality.

## 🌐 Live Deployments

### Primary Deployment (Recommended)
- **Netlify**: [https://ramachandra-portfolio.netlify.app](https://ramachandra-portfolio.netlify.app)
  - ✅ Fully functional with all features
  - ✅ Chatbot integration working
  - ✅ Dark mode toggle active
  - ✅ Fast CDN delivery

### Alternative Deployments
- **Custom Domain**: [https://nalamportfolio.dev](https://nalamportfolio.dev)
- **GitHub Pages**: [https://vamsi-klu.github.io/nalamportfolio-codebase/](https://vamsi-klu.github.io/nalamportfolio-codebase/)

## ✨ Key Features

### 🤖 AI-Powered Chatbot
- **File**: `chatbot.js`
- **Functionality**: Interactive AI assistant for visitor engagement
- **Integration**: Calls `/api/chat` endpoint for Gemini AI responses
- **UI**: Minimalist chat widget with user-friendly interface
- **Features**:
  - Real-time message handling
  - Error handling and retry logic
  - Responsive design
  - Accessibility support

### 🌙 Dark/Light Mode Toggle
- **Implementation**: CSS custom properties with JavaScript toggle
- **Storage**: Persists user preference in localStorage
- **Icon**: Dynamic moon 🌙 / sun ☀️ indicator
- **Smooth Transitions**: CSS transitions for seamless mode switching
- **Theme Support**: Complete color scheme adaptation

### 📱 Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Breakpoints**: Tablet, desktop, and large screen support
- **Navigation**: Hamburger menu for mobile devices
- **Typography**: Scalable font system
- **Images**: Responsive image handling

### 🎨 Modern UI/UX
- **Design System**: Consistent color palette and typography
- **Animations**: Smooth hover effects and transitions
- **Cards**: Interactive project showcase cards with flip animations
- **Icons**: Professional iconography throughout
- **Accessibility**: ARIA labels and semantic HTML

## 🛠️ Technical Implementation

### Frontend Stack
- **HTML5**: Semantic markup with accessibility features
- **CSS3**:
  - Custom properties for theming
  - Flexbox and Grid layouts
  - CSS animations and transitions
  - Media queries for responsiveness
- **JavaScript (ES6+)**:
  - Modular code structure
  - Event handling
  - LocalStorage integration
  - Fetch API for chatbot communication

### File Structure
```
nalamportfolio-codebase/
├── index.html              # Main HTML file
├── styles.css              # Main stylesheet with theme support
├── main.js                 # Core JavaScript functionality
├── chatbot.js              # AI chatbot implementation
├── server.py               # Python Flask backend for chatbot
├── api/
│   └── gemini_client.py    # Gemini AI integration
├── attached_assets/        # Images and documents
├── tests/                  # Python tests
├── tests_js/              # JavaScript tests
├── .github/
│   └── workflows/         # GitHub Actions deployment
└── package.json           # Node.js dependencies
```

### Backend Components
- **Python Flask Server**: `server.py`
- **Gemini AI Integration**: `api/gemini_client.py`
- **Environment Configuration**: `.env` file for API keys
- **Dependencies**: Listed in `requirements.txt`

## 🚀 Deployment Process

### Netlify Deployment (Recommended)
1. **Automatic**: Connected to GitHub repository
2. **Build Command**: None (static site)
3. **Publish Directory**: Root (`/`)
4. **Custom Domain**: Optional configuration
5. **SSL**: Automatic HTTPS certificate

### GitHub Actions Workflow
- **File**: `.github/workflows/deploy-pages.yml`
- **Trigger**: Push to main branch
- **Process**:
  - Checkout repository
  - Copy static files to `_site`
  - Deploy to GitHub Pages
- **Status**: Configured but GitHub Pages has deployment issues

### Manual Deployment
```bash
# Clone repository
git clone https://github.com/Vamsi-klu/nalamportfolio-codebase.git

# Install dependencies (for development)
npm install

# For Python backend (optional)
pip install -r requirements.txt

# Deploy to Netlify
netlify deploy --dir=. --prod
```

## 💼 Professional Content

### Experience Highlights
- **Meta (Current)**: Data Engineer handling 50B+ daily events
- **Amazon**: ETL pipeline optimization and real-time analytics
- **University at Buffalo**: ML models for student success prediction
- **Nike India**: Large-scale data processing and automation

### Technical Skills
- **Languages**: Python, R, Scala, SQL, JavaScript
- **Big Data**: Apache Spark, Hadoop, Kafka, Airflow
- **Cloud**: AWS (Glue, S3, Redshift), Azure, GCP
- **Databases**: Snowflake, PostgreSQL, MongoDB
- **Tools**: dbt, Tableau, Power BI, Docker, Git

### Featured Projects
1. **Real-time Messaging Analytics** (Meta)
2. **AWS Streaming & ETL** (Amazon)
3. **Student Success Analytics** (UB)
4. **Enterprise ETL Platform** (Nike)
5. **Load Forecasting System** (Freelance)

## 🔧 How to Use

### For Visitors
1. **Browse Portfolio**: Navigate through sections using the menu
2. **Dark Mode**: Click the 🌙/☀️ icon in the navigation
3. **Chat Support**: Use the chatbot for questions about experience
4. **Contact**: Multiple contact options available
5. **Projects**: Click project cards to see detailed information

### For Developers
1. **Fork Repository**: Create your own copy
2. **Customize Content**: Update `index.html` with your information
3. **Modify Styles**: Edit `styles.css` for visual changes
4. **Add Features**: Extend `main.js` for additional functionality
5. **Deploy**: Use Netlify, Vercel, or GitHub Pages

### Environment Setup
```bash
# Development server (optional)
npm install -g live-server
live-server

# Python backend setup
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Add your GEMINI_API_KEY
```

## 🧪 Testing

### JavaScript Tests
- **Location**: `tests_js/`
- **Framework**: Jest
- **Run Tests**: `npm test`
- **Coverage**: Chatbot functionality and UI interactions

### Python Tests
- **Location**: `tests/`
- **Framework**: pytest
- **Run Tests**: `pytest`
- **Coverage**: Backend API and Gemini integration

### Test Coverage
```bash
# Run all tests
npm test && pytest

# Coverage report
npm run test:coverage
pytest --cov=api
```

## 📈 Performance Optimizations

### Frontend
- **Minified Assets**: Compressed CSS and JavaScript
- **Image Optimization**: Responsive images with proper sizing
- **Lazy Loading**: Deferred loading for non-critical resources
- **Caching**: Browser caching headers

### Backend
- **CDN**: Netlify global CDN distribution
- **Compression**: Gzip compression enabled
- **SSL**: HTTPS for security and performance
- **Monitoring**: Netlify analytics and error tracking

## 🔄 Recent Updates

### Version 2.0 (Latest)
- ✅ Added AI-powered chatbot functionality
- ✅ Implemented dark/light mode toggle
- ✅ Enhanced responsive design
- ✅ Deployed to Netlify for reliability
- ✅ Added comprehensive testing suite
- ✅ Improved accessibility features

### Version 1.0
- ✅ Initial portfolio structure
- ✅ Professional content integration
- ✅ Basic responsive design
- ✅ GitHub Pages deployment

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Ramachandra Vamsi Krishna Nalam**
- **Email**: [nrcvamsi@gmail.com](mailto:nrcvamsi@gmail.com)
- **LinkedIn**: [ramachandra-nalam](https://www.linkedin.com/in/ramachandra-nalam/)
- **Phone**: +1 (508) 614-0301
- **Location**: Seattle, WA

## 🙏 Acknowledgments

- **Claude AI**: For assistance with chatbot implementation
- **Netlify**: For reliable hosting and deployment
- **Google Gemini**: For AI-powered chat responses
- **Meta**: For current professional experience
- **Open Source Community**: For tools and inspiration

---

**⭐ Star this repository if you find it helpful!**

*Built with ❤️ by Ramachandra Nalam*