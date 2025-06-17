#!/bin/bash

# Sify Cloud Demo - Setup Script
# Automated installation and configuration

echo "🚀 Setting up Sify Cloud Demo..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to project directory
cd sify-cloud-demo

echo "📦 Installing dependencies..."
npm install

echo "🔧 Building the project..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "🌐 To start the development server:"
echo "   cd sify-cloud-demo"
echo "   npm run dev"
echo ""
echo "🚀 To build for production:"
echo "   npm run build"
echo ""
echo "📱 Demo Features:"
echo "   ✅ Manual demo selection (Standard/Custom)"
echo "   ✅ Role-based workflow (AM/SA/PM/Finance)"
echo "   ✅ Internal SKU codes for all resources"
echo "   ✅ Edit functionality in BoQ"
echo "   ✅ Contract terms with discounts"
echo "   ✅ Auto-added essential services"
echo "   ✅ Bulk CPU/RAM summary"
echo "   ✅ Professional UI/UX"
echo ""
echo "🎯 Live Demo: https://bmmgqusf.manus.space"

