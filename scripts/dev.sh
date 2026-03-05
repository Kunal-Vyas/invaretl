#!/bin/bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check for required tools
check_requirements() {
    echo "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker found"
    
    if ! command -v docker compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_success "Docker Compose found"
    
    if ! command -v java &> /dev/null; then
        print_error "Java is not installed"
        exit 1
    fi
    print_success "Java found"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js found"
    
    echo ""
}

# Setup environment
setup_env() {
    if [ ! -f .env ]; then
        print_warning "No .env file found. Creating from template..."
        cp .env.example .env
        print_warning "Please edit .env file with your configuration"
        echo ""
    else
        print_success ".env file found"
    fi
}

# Start development environment
start_dev() {
    echo "Starting development environment..."
    
    # Start database
    echo "Starting PostgreSQL database..."
    docker compose -f docker-compose.yml up -d db
    
    # Wait for database to be ready
    echo "Waiting for database to be ready..."
    sleep 10
    
    # Start backend and frontend in background
    echo "Starting backend..."
    ./gradlew :server:bootRun &
    BACKEND_PID=$!
    
    echo "Starting frontend..."
    cd ui
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    echo ""
    print_success "Development environment started!"
    echo "Backend: http://localhost:8080"
    echo "Frontend: http://localhost:5173"
    echo "H2 Console: http://localhost:8080/h2-console"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Trap signals to clean up
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker compose -f docker-compose.yml down; exit" INT TERM
    
    # Wait for background processes
    wait
}

# Run tests
run_tests() {
    echo "Running tests..."
    
    echo "Running backend tests..."
    ./gradlew test
    
    echo ""
    echo "Running frontend tests..."
    cd ui
    npm test
    cd ..
    
    echo ""
    print_success "All tests completed!"
}

# Build for production
build_prod() {
    echo "Building for production..."
    
    echo "Building Docker image..."
    docker build -t invaretl:latest .
    
    print_success "Production build completed!"
}

# Main menu
case "${1:-}" in
    "dev"|"start")
        check_requirements
        setup_env
        start_dev
        ;;
    "test")
        check_requirements
        run_tests
        ;;
    "build")
        check_requirements
        build_prod
        ;;
    "prod")
        check_requirements
        setup_env
        echo "Starting production environment..."
        docker compose -f docker-compose.prod.yml up -d
        print_success "Production environment started!"
        ;;
    "down")
        echo "Stopping all services..."
        docker compose -f docker-compose.yml down 2>/dev/null || true
        docker compose -f docker-compose.prod.yml down 2>/dev/null || true
        print_success "All services stopped!"
        ;;
    "clean")
        echo "Cleaning up..."
        ./gradlew clean
        cd ui && npm run clean 2>/dev/null || true && cd ..
        docker system prune -f
        print_success "Cleanup completed!"
        ;;
    *)
        echo "Usage: $0 {dev|test|build|prod|down|clean}"
        echo ""
        echo "Commands:"
        echo "  dev    - Start development environment (backend + frontend + db)"
        echo "  test   - Run all tests"
        echo "  build  - Build Docker image for production"
        echo "  prod   - Start production environment"
        echo "  down   - Stop all services"
        echo "  clean  - Clean up build artifacts and Docker"
        exit 1
        ;;
esac