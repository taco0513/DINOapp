#!/bin/bash

# DINO Application Deployment Script
# Supports multiple deployment platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    log_success "Dependencies check passed"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        log_error "package.json not found"
        exit 1
    fi
    
    # Check if .env.local exists (for local deployment)
    if [ ! -f ".env.local" ] && [ "$PLATFORM" != "vercel" ]; then
        log_warning ".env.local not found. Make sure environment variables are set properly."
    fi
    
    # Run tests
    log_info "Running tests..."
    npm run test || {
        log_error "Tests failed"
        exit 1
    }
    
    # Run type check
    log_info "Running type check..."
    npm run type-check || {
        log_warning "Type check failed, but continuing deployment"
    }
    
    log_success "Pre-deployment checks passed"
}

# Docker deployment
deploy_docker() {
    log_info "Deploying with Docker..."
    
    # Build Docker image
    docker build -t dino-app . || {
        log_error "Docker build failed"
        exit 1
    }
    
    # Stop existing container if running
    docker stop dino-app-container 2>/dev/null || true
    docker rm dino-app-container 2>/dev/null || true
    
    # Run new container
    docker run -d \
        --name dino-app-container \
        -p 3000:3000 \
        -e NODE_ENV=production \
        -e NEXTAUTH_SECRET="${NEXTAUTH_SECRET}" \
        -e GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID}" \
        -e GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET}" \
        -v "$(pwd)/prisma/dev.db:/app/prisma/dev.db" \
        dino-app || {
        log_error "Docker run failed"
        exit 1
    }
    
    log_success "Docker deployment completed"
    log_info "Application running at http://localhost:3000"
}

# Vercel deployment
deploy_vercel() {
    log_info "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        log_info "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    if [ "$PRODUCTION" = "true" ]; then
        vercel --prod || {
            log_error "Vercel production deployment failed"
            exit 1
        }
    else
        vercel || {
            log_error "Vercel preview deployment failed"
            exit 1
        }
    fi
    
    log_success "Vercel deployment completed"
}

# Railway deployment
deploy_railway() {
    log_info "Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        log_info "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    railway up || {
        log_error "Railway deployment failed"
        exit 1
    }
    
    log_success "Railway deployment completed"
}

# Netlify deployment
deploy_netlify() {
    log_info "Deploying to Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        log_info "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Build the application
    npm run build || {
        log_error "Build failed"
        exit 1
    }
    
    # Deploy to Netlify
    if [ "$PRODUCTION" = "true" ]; then
        netlify deploy --prod --dir=.next || {
            log_error "Netlify production deployment failed"
            exit 1
        }
    else
        netlify deploy --dir=.next || {
            log_error "Netlify preview deployment failed"
            exit 1
        }
    fi
    
    log_success "Netlify deployment completed"
}

# Main deployment function
deploy() {
    case $PLATFORM in
        "docker")
            deploy_docker
            ;;
        "vercel")
            deploy_vercel
            ;;
        "railway")
            deploy_railway
            ;;
        "netlify")
            deploy_netlify
            ;;
        *)
            log_error "Unknown platform: $PLATFORM"
            log_info "Supported platforms: docker, vercel, railway, netlify"
            exit 1
            ;;
    esac
}

# Main script
main() {
    log_info "DINO Application Deployment Script"
    log_info "=================================="
    
    # Parse arguments
    PLATFORM=${1:-"docker"}
    PRODUCTION=${2:-"false"}
    
    log_info "Platform: $PLATFORM"
    log_info "Production: $PRODUCTION"
    
    # Run checks and deployment
    check_dependencies
    pre_deployment_checks
    deploy
    
    log_success "Deployment completed successfully!"
}

# Run main function with all arguments
main "$@"