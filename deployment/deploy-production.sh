#!/bin/bash

echo "🚀 Deploying Friendship School Management System to Production"
echo "Domain: https://fs.wedge-kc.mywire.org/"
echo "================================================"

# Stop any existing processes
echo "🛑 Stopping existing processes..."
pkill -f "npm run dev" || true
pkill -f "next start" || true

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Start the application with PM2
echo "🚀 Starting application with PM2..."
cd /root/Friendship_School-project
pm2 delete friendship-school 2>/dev/null || true
pm2 start npm --name "friendship-school" -- start
pm2 save
pm2 startup

echo "✅ Deployment completed!"
echo ""
echo "🌐 Your application is now running at:"
echo "   https://fs.wedge-kc.mywire.org/"
echo ""
echo "📊 PM2 Status:"
pm2 status
echo ""
echo "📝 To view logs: pm2 logs friendship-school"
echo "🔄 To restart: pm2 restart friendship-school"
echo "🛑 To stop: pm2 stop friendship-school"
