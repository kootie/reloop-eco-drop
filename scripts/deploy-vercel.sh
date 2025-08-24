#!/bin/bash

# =============================================================================
# RELOOP LIVE - Vercel Deployment Script
# =============================================================================

set -e  # Exit on any error

echo "🚀 Starting Reloop Live deployment to Vercel..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed. Please install it first:"
        echo "npm i -g vercel"
        exit 1
    fi
    print_success "Vercel CLI found"
}

# Check if we're in the right directory
check_directory() {
    if [ ! -f "package.json" ] || [ ! -f "vercel.json" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    print_success "Project directory verified"
}

# Check environment file
check_env_file() {
    if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
        print_warning "No .env file found. Please ensure environment variables are set in Vercel dashboard"
    else
        print_success "Environment file found"
    fi
}

# Build the project
build_project() {
    print_status "Building the project..."
    npm run build
    print_success "Build completed successfully"
}

# Deploy to Vercel
deploy_to_vercel() {
    print_status "Deploying to Vercel..."
    
    if [ "$1" = "--prod" ]; then
        print_status "Production deployment requested"
        vercel --prod
    else
        print_status "Preview deployment requested"
        vercel
    fi
}

# Main deployment function
main() {
    echo "=============================================================================="
    echo "RELOOP LIVE - Vercel Deployment"
    echo "=============================================================================="
    
    # Pre-deployment checks
    check_vercel_cli
    check_directory
    check_env_file
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install
    
    # Build project
    build_project
    
    # Deploy
    if [ "$1" = "--prod" ]; then
        deploy_to_vercel --prod
    else
        deploy_to_vercel
    fi
    
    print_success "Deployment completed!"
    echo ""
    echo "Next steps:"
    echo "1. Check your Vercel dashboard for deployment status"
    echo "2. Verify environment variables are set correctly"
    echo "3. Test the deployed application"
    echo "4. Check treasury functionality in admin dashboard"
}

# Handle command line arguments
case "$1" in
    --prod)
        main --prod
        ;;
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --prod    Deploy to production"
        echo "  --help    Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0          # Deploy preview"
        echo "  $0 --prod   # Deploy to production"
        ;;
    *)
        main
        ;;
esac
