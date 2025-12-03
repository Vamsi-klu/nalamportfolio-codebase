#!/bin/bash

# Portfolio Deployment Script
# This script ensures consistent deployments across environments

set -e  # Exit on any error

echo "🚀 Starting Portfolio Deployment..."

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Are you in the portfolio directory?"
    exit 1
fi

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Clean any existing .netlify directory with problematic configs
if [ -d ".netlify" ]; then
    echo "🧹 Cleaning old Netlify configuration..."
    rm -rf .netlify
fi

# Ensure proper netlify.toml exists
if [ ! -f "netlify.toml" ]; then
    echo "❌ Error: netlify.toml not found. Please ensure it exists."
    exit 1
fi

# Validate essential files
REQUIRED_FILES=("index.html" "styles.css" "main.js" "chatbot.js")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: Required file $file not found."
        exit 1
    fi
done

echo "✅ All required files present."

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=. --message="Automated deployment $(date)"

# Check deployment status
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🔗 Site: https://ramachandra-portfolio.netlify.app"

    # Test the deployment
    echo "🧪 Testing deployment..."
    sleep 5
    if curl -s -o /dev/null -w "%{http_code}" https://ramachandra-portfolio.netlify.app | grep -q "200"; then
        echo "✅ Site is responding correctly!"
    else
        echo "⚠️  Site deployed but may need a moment to propagate."
    fi
else
    echo "❌ Deployment failed!"
    exit 1
fi

echo "🎉 Portfolio deployment complete!"