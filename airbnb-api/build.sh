#!/bin/bash

# Build script for Render deployment
echo "🔧 Starting build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Build TypeScript
echo "🏗️ Building TypeScript..."
npx tsc

echo "✅ Build completed successfully!"