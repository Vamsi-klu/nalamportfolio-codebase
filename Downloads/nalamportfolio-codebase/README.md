# 🚀 Modern Portfolio Website

![Deploy to Pages](https://github.com/Vamsi-klu/portfolioweb/actions/workflows/deploy-pages.yml/badge.svg)

Repository: https://github.com/Vamsi-klu/portfolioweb
Live Site: https://nalamportfolio.dev/

Quick Start
- Local: `python3 server.py` then open `http://localhost:5000`
- Static hosting: Push to `main` on GitHub and enable GitHub Pages
- Stop local server: Ctrl+C in the terminal running `server.py`

A sleek, modern portfolio website showcasing data engineering expertise with interactive features and professional design. Built with vanilla JavaScript for optimal performance, featuring 3D animations, theme switching, and responsive design.

## 👨‍💻 About

**Ramachandra Nalam** - Data Engineer specializing in real-time analytics and data pipelines with 7+ years of experience building large-scale data systems across technology, retail, and financial domains.

## 🌟 Features

### 🎴 Interactive Flash Card Projects
- **3D Flip Animation**: Click any project card to reveal detailed information
- **Project Showcase**: 6 comprehensive projects with tech stacks and achievements
- **Smooth Transitions**: CSS-based animations for seamless user experience
- **Professional Layout**: Clean, modern card design with hover effects

### 🎨 Dark/Light Theme Toggle
- **Persistent Themes**: Theme preference saved in localStorage
- **Smooth Transitions**: CSS variables enable fluid color transitions
- **Accessible Design**: High contrast ratios in both themes
- **Icon Feedback**: Dynamic moon/sun icons indicating current theme

### 👤 Professional Profile Integration
- **LinkedIn Photo**: Professional headshot with hover effects
- **Contact Information**: Direct email and phone links
- **Location Display**: Current location (Seattle, WA)
- **Professional Summary**: Comprehensive background overview

### 📊 Clean Skills Display
- **No Percentages**: Clean, professional skill representation
- **Hover Interactions**: Visual feedback on skill hover
- **Categorized Skills**: Technical skills grouped by category
- **Technology Tags**: Comprehensive list of tools and technologies

### 📋 Modern Experience Timeline
- **Grid Layout**: Professional timeline with aligned content
- **Visual Indicators**: Timeline dots and connecting lines
- **Staggered Animations**: Experience items appear with delays
- **Hover Effects**: Interactive cards with transform effects

### 📱 Responsive Design
- **Mobile-First**: Optimized for mobile devices first
- **Hamburger Navigation**: Clean mobile navigation
- **Flexible Layouts**: Adapts to all screen sizes
- **Touch-Friendly**: Large touch targets for mobile users

## 🛠️ Technologies & Skills

### **Languages**
- Python, R, Scala, SQL, JavaScript, TypeScript

### **Frameworks & Tools**
- Apache Spark, PySpark, Spark SQL
- Apache Kafka, Apache Hadoop, Apache Airflow
- dbt, Great Expectations, TensorFlow, scikit-learn
- Apache NiFi

### **Visualization & BI**
- Tableau, Looker, Power BI, Google Data Studio
- Matplotlib, Seaborn

### **Cloud Platforms**
- AWS (S3, Glue, Redshift)
- Azure (ADF, Data Lake)
- GCP (BigQuery)
- Snowflake

### **DevOps & Tools**
- Git, Jenkins, Docker, Jira
- Databricks, OLAP/OLTP
- Data Vault Modeling, KPI Dashboards, CI/CD

## 📁 Project Structure

```
portfolio/
├── 📄 index.html              # Main HTML file
├── 🎨 styles.css              # All CSS styles and themes
├── ⚡ main.js                 # JavaScript functionality
├── 🖼️ profile-image.jpg       # Professional headshot
├── 🐍 server.py               # Python development server
├── 📚 README.md               # Project documentation
├── 📝 CHANGES.md              # Change log
└── 📋 replit.md               # Project configuration
```

## 🎯 Featured Projects

### 🤖 Competitive Marketing Intelligence using GenAI
GenAI chatbot with LLMs, NLP and vector search extracting insights from earnings calls; improved data accessibility by 30%.
- **Tech Stack:** GenAI, LLM, NLP, Vector Search

### ⚡ Real‑time Messaging Analytics (Meta)
Kafka + Spark pipelines for 50B+ events/day; dbt semantic layers; Looker dashboards; 99.9% data quality with Great Expectations.
- **Tech Stack:** Kafka, Spark, dbt, Looker, Great Expectations

### ☁️ AWS Streaming & ETL Optimization (Amazon)
Glue ETL S3→Aurora, Kafka 500k eps, Redshift tuning cut CPU 52%, BI automation increased campaign reach 20%.
- **Tech Stack:** AWS Glue, Aurora, Kafka, Redshift, BI

### 🧠 Student Success Analytics (UB)
Models (LR/DT/RF) for 3,500 at‑risk students; 88.7% accuracy; improved graduation outcomes by 23% for target groups.
- **Tech Stack:** ML, Python, Snowflake, Redshift

### 💻 Nike ETL Platform
ETL across 5 queues, 6M+ records/day, PySpark 20TB+/day with NiFi and Hive; 98% data availability.
- **Tech Stack:** PySpark, NiFi, Hive, Snowflake

### 📊 Household Load Forecasting ML
TensorFlow‑based load forecasting; 10% energy cost reduction and 8% fewer service disruptions.
- **Tech Stack:** TensorFlow, Forecasting, Time Series

## 🚀 Getting Started

### Prerequisites
- Python 3.x (for development server)
- Modern web browser
- Git (for cloning)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio
   ```

2. **Start the development server**
   ```bash
   python server.py
   ```

3. **Open in browser**
```
http://localhost:5000
```

### Replit Usage
- Import from GitHub: Replit → Create Repl → Import from GitHub → `Vamsi-klu/portfolioweb`.
- Run: Click Run (uses `.replit` to run `python server.py`).
- Port: Replit assigns `PORT`; server reads it automatically.
- Pull latest from GitHub: Replit → Version Control → Pull (or shell: `git pull origin main`).
- Auto‑deploy on push (optional): Replit → Deployments → New Deployment (Web Server) → select branch `main` → enable auto‑redeploy.
- Custom domain on Replit (optional): In the deployment, add your domain and follow the DNS prompts Replit shows.

Note: Production hosting is set up for GitHub Pages at `nalamportfolio.dev`. If you point DNS to Replit instead, remove the GitHub Pages A/CNAME records so only one hosting provider controls the domain.

### Deployment Options

#### Netlify (Recommended)
- **Auto-deploy:** Connected to GitHub for automatic deployments
- **Static hosting:** Perfect for this portfolio (no server-side processing needed)
- **Custom domain:** Support with SSL
- **CDN:** Global content delivery network

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### GitHub Pages + Custom Domain
This repo auto-deploys with GitHub Actions. Custom domain is configured via `CNAME`.

Steps (one-time):
- Apex domain (nalamportfolio.dev): add A records to GitHub Pages IPs (per GitHub docs) or use ALIAS/ANAME flattening.
- In GitHub → Settings → Pages, verify the Custom domain is `nalamportfolio.dev` and enforce HTTPS.
- The workflow will publish on each push to `main`.

Subdomain (www)
- Create `CNAME` record for `www` → `vamsi-klu.github.io` (recommended by GitHub Pages).
- The site includes a small client-side redirect so `www.nalamportfolio.dev` redirects to `https://nalamportfolio.dev` for a single canonical URL.

Notes
- This site is fully static (HTML/CSS/JS) — no build step required.
- Custom domain and HTTPS are supported via GitHub Pages settings.

## 🎨 Customization

### Update Personal Information
Edit the contact information directly in `index.html`:
```html
<!-- Update these sections in index.html -->
<div class="profile-item">
    <strong>Name:</strong> Your Name
</div>
<div class="profile-item">
    <strong>Email:</strong> <a href="mailto:your.email@example.com">your.email@example.com</a>
</div>
```

### Add/Update Projects
Edit the projects section directly in `index.html`:
```html
<!-- Add new project cards following this structure -->
<div class="project-card" onclick="flipCard(this)">
    <div class="card-inner">
        <div class="card-front">
            <div class="project-icon">🚀</div>
            <h3>Your Project Name</h3>
            <div class="project-category">Your Category</div>
            <div class="card-hint">Click to reveal details</div>
        </div>
        <div class="card-back">
            <h3>Your Project Name</h3>
            <div class="project-details">
                <p>Your project description</p>
            </div>
            <div class="project-tags">
                <span class="tag">Tag1</span>
                <span class="tag">Tag2</span>
            </div>
        </div>
    </div>
</div>
```

### Customize Themes
Modify CSS variables in `styles.css` and `classic/styles.css`:
```css
:root {
  --bg: #your-background-color;
  --fg: #your-text-color;
  --accent: #your-accent-color;
  --accent-2: #your-secondary-accent;
}
```

## 📱 Responsive Design

- **Mobile-first approach** with touch-friendly interactions
- **Adaptive layouts** for tablets and desktops
- **Optimized animations** for different screen sizes
- **Reduced motion support** for accessibility

## ♿ Accessibility Features

- **ARIA labels** and semantic HTML
- **Keyboard navigation** support
- **Screen reader friendly**
- **High contrast** theme options
- **Reduced motion** preferences respected

## 🔧 Browser Support

- **Modern browsers:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile browsers:** iOS Safari 14+, Chrome Mobile 90+
- **Progressive enhancement:** Graceful degradation for older browsers

## 📊 Analytics & Tracking

- **Client-side logging** of user interactions
- **Privacy-focused** approach (no external tracking)
- **Event tracking** for portfolio engagement
- **Performance monitoring** capabilities

## 🔒 Security

- **No sensitive data** stored in client-side code
- **XSS protection** with proper escaping
- **CSP headers** recommended for production
- **HTTPS required** for full functionality

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Vamsi-klu/portfolioweb/issues).

## 📞 Contact

- **Email:** nrcvamsi@gmail.com
- **Phone:** +1 (508) 614-0301
- **LinkedIn:** [ramachandra-nalam](https://www.linkedin.com/in/ramachandra-nalam/)
- **GitHub:** [Vamsi-klu](https://github.com/Vamsi-klu)
- **Location:** Seattle, WA 98104

---

## 🎉 Easter Eggs & Hidden Features

Try these commands in the terminal interface:
- `matrix` - Toggle Matrix rain effect
- `particles` - Toggle particle system
- `hack` - Enter hacker mode
- `konami` - Special surprise
- `rainbow` - Colorful text effect
- `glitch` - Trigger glitch animation
- Use **Cmd/Ctrl+K** in classic interface for command palette
- Click on skill chips to filter projects
- Try the auto-complete with Tab key

Built with ❤️ by **Ramachandra Nalam**
