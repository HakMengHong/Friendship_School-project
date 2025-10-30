#!/bin/bash

# Quick Deployment Script for Friendship School
# Run this script on your Ubuntu server for fast deployment

set -e

echo "🚀 Friendship School - Quick Deployment Script"
echo "=============================================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    echo "❌ Please run this script as a regular user with sudo privileges"
    exit 1
fi

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/friendship-school
sudo chown $USER:$USER /opt/friendship-school

# Download deployment script
echo "📥 Downloading deployment script..."
cd /opt/friendship-school

# Make the deployment script executable
chmod +x deploy.sh

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Upload your project files to /opt/friendship-school/"
echo "2. Run: cd /opt/friendship-school && ./deploy.sh"
echo ""
echo "💡 Upload methods:"
echo "   - SCP: scp -r /path/to/project/* user@server:/opt/friendship-school/"
echo "   - SFTP: Use FileZilla or similar"
echo "   - Git: git clone your-repo-url /opt/friendship-school/"
echo ""
echo "🔧 The deployment script will:"
echo "   - Install Docker and Docker Compose"
echo "   - Configure environment"
echo "   - Deploy the application"
echo "   - Setup SSL certificate (if domain provided)"
echo "   - Configure firewall and backups"
echo ""
echo "📞 Need help? Check UBUNTU_DEPLOYMENT_GUIDE.md for detailed instructions"
