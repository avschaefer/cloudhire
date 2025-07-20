#!/bin/bash

# CloudHire Deployment Script
# This script automates the deployment process to Cloudflare Workers

set -e  # Exit on any error

echo "🚀 Starting CloudHire deployment..."

# Check if Node.js version is 22+
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo "❌ Error: Node.js 22+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version check passed: $(node -v)"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Test configuration
echo "🔧 Testing configuration..."
npm run test:config
npm run test:email

# Build the application
echo "🔨 Building application..."
npm run build:opennext

# Deploy to Cloudflare Workers
echo "🚀 Deploying to Cloudflare Workers..."
wrangler deploy

echo "✅ Deployment completed successfully!"
echo "🌐 Your application is now live at: https://cloudhire.avschaefer.workers.dev"
echo "📊 Monitor logs with: wrangler tail" 