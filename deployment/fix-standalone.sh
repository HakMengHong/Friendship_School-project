#!/bin/bash
# Fix for Next.js standalone static files serving issue
# This script copies static files to the standalone directory after build

echo "🔧 Fixing Next.js standalone static files..."

# Stop PM2 if running
echo "📛 Stopping PM2 process..."
pm2 stop friendship-school 2>/dev/null || echo "PM2 process not running"

# Copy static files to standalone directory
echo "📁 Copying static files to standalone directory..."
if [ -d ".next/static" ] && [ -d ".next/standalone/.next" ]; then
    cp -r .next/static .next/standalone/.next/
    echo "✅ Static files copied successfully"
else
    echo "❌ Error: Required directories not found"
    echo "   Make sure you have run 'npm run build' first"
    exit 1
fi

# Copy logo files to standalone public directory
echo "🖼️ Copying logo files to standalone public directory..."
if [ -d "public" ] && [ -d ".next/standalone/public" ]; then
    cp public/"Friendship Primary School's Logo.png" .next/standalone/public/ 2>/dev/null
    cp public/"Friendship High School's Logo.png" .next/standalone/public/ 2>/dev/null
    cp public/"Center-for-the-Future-of-Cambodias-Youth-Logo.png" .next/standalone/public/ 2>/dev/null
    echo "✅ Logo files copied successfully"
else
    echo "⚠️ Warning: Could not copy logo files"
fi

# Restart PM2
echo "🚀 Starting PM2 process..."
pm2 start .next/standalone/server.js --name friendship-school || pm2 restart friendship-school

echo "✅ Fix applied successfully!"
echo "📡 Your application should now work correctly in the browser"
echo "🌐 Access your app at: http://localhost:3000"
