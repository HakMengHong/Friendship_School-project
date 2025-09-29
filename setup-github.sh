#!/bin/bash

# GitHub Setup Script for Friendship School Project
# This script helps you set up your project on GitHub

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="friendship-school-project"
GITHUB_USERNAME=""
REPO_DESCRIPTION="A comprehensive school management system built with Next.js, TypeScript, and PostgreSQL"

# Functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
check_git() {
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    print_success "Git is installed"
}

# Check if GitHub CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_warning "GitHub CLI is not installed."
        print_status "You can install it from: https://cli.github.com/"
        print_status "Or continue with manual setup."
        return 1
    fi
    print_success "GitHub CLI is installed"
    return 0
}

# Setup git configuration
setup_git_config() {
    print_status "Setting up Git configuration..."
    
    # Check if git config is already set
    if ! git config --global user.name &> /dev/null; then
        read -p "Enter your Git username: " GIT_USERNAME
        git config --global user.name "$GIT_USERNAME"
    fi
    
    if ! git config --global user.email &> /dev/null; then
        read -p "Enter your Git email: " GIT_EMAIL
        git config --global user.email "$GIT_EMAIL"
    fi
    
    print_success "Git configuration completed"
}

# Create GitHub repository with CLI
create_repo_with_cli() {
    print_status "Creating GitHub repository with CLI..."
    
    # Login to GitHub CLI
    gh auth login
    
    # Create repository
    gh repo create "$REPO_NAME" \
        --description "$REPO_DESCRIPTION" \
        --public \
        --source=. \
        --remote=origin \
        --push
    
    print_success "Repository created and pushed to GitHub"
}

# Manual repository creation instructions
show_manual_setup() {
    print_status "Manual GitHub repository setup:"
    echo
    echo "1. Go to https://github.com/new"
    echo "2. Repository name: $REPO_NAME"
    echo "3. Description: $REPO_DESCRIPTION"
    echo "4. Make it Public"
    echo "5. Don't initialize with README (we already have one)"
    echo "6. Click 'Create repository'"
    echo
    echo "Then run these commands:"
    echo "git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo "git branch -M main"
    echo "git push -u origin main"
}

# Add all files and commit
commit_changes() {
    print_status "Adding files and committing changes..."
    
    # Add all files
    git add .
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        print_warning "No changes to commit"
        return 0
    fi
    
    # Commit changes
    git commit -m "🚀 Initial commit: Friendship School Management System

✨ Features:
- Modern school management system
- Student, attendance, and grade management
- PDF report generation
- Docker deployment ready
- Ubuntu server deployment scripts
- Modern UI with glassmorphism effects
- Khmer language support
- Responsive design

🛠️ Tech Stack:
- Next.js 15.5.2 with TypeScript
- PostgreSQL with Prisma ORM
- Tailwind CSS with Radix UI
- Docker containerization
- Nginx reverse proxy

📋 Ready for production deployment!"
    
    print_success "Changes committed successfully"
}

# Push to GitHub
push_to_github() {
    print_status "Pushing to GitHub..."
    
    # Check if remote exists
    if git remote get-url origin &> /dev/null; then
        print_status "Remote origin already exists"
    else
        print_status "Adding remote origin..."
        git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    fi
    
    # Push to GitHub
    git push -u origin main
    
    print_success "Code pushed to GitHub successfully"
}

# Setup GitHub repository
setup_github_repo() {
    if [ -z "$GITHUB_USERNAME" ]; then
        read -p "Enter your GitHub username: " GITHUB_USERNAME
    fi
    
    if check_gh_cli; then
        create_repo_with_cli
    else
        show_manual_setup
        read -p "Press Enter after creating the repository on GitHub..."
    fi
}

# Main setup function
main() {
    print_status "🚀 Setting up Friendship School Project for GitHub"
    echo
    
    # Get GitHub username
    read -p "Enter your GitHub username: " GITHUB_USERNAME
    
    # Run setup steps
    check_git
    setup_git_config
    commit_changes
    setup_github_repo
    
    if ! check_gh_cli; then
        push_to_github
    fi
    
    print_success "🎉 GitHub setup completed successfully!"
    echo
    print_status "Your repository is now available at:"
    echo "https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo
    print_status "Next steps:"
    echo "1. Set up GitHub Actions secrets (if needed)"
    echo "2. Configure branch protection rules"
    echo "3. Set up deployment to your server"
    echo "4. Add collaborators if needed"
    echo
    print_status "Deployment options:"
    echo "- Use the deploy.sh script for Ubuntu server deployment"
    echo "- Set up GitHub Actions for automated deployment"
    echo "- Use Docker for containerized deployment"
}

# Run main function
main "$@"
