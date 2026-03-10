#!/bin/bash
set -euo pipefail

# ---------------------------------------------------------------------------
# Java 21 auto-detection
#
# The Kotlin DSL (bundled in Gradle 8.x) cannot parse the Java 25 version
# string, causing "IllegalArgumentException: 25.0.1" at configuration time.
# We need a Java 21 JDK to run Gradle itself (the :server subproject still
# compiles to Java 21 bytecode via its toolchain declaration, regardless of
# which JDK runs Gradle).
#
# Strategy (first match wins):
#   1. JAVA_HOME already set and points to a Java 21 JDK  -> keep it
#   2. A sibling jdk-21* directory next to the current JAVA_HOME           -> use it
#   3. Common installation roots on Windows/macOS/Linux                    -> scan
#   4. `java -version` is already 21                                       -> keep it
#   5. Give up and let the user know what to fix
# ---------------------------------------------------------------------------
_find_java21() {
    # Helper: print the JDK home if `java` inside it reports version 21
    local candidate="$1"
    local java_bin="${candidate}/bin/java"
    if [ -x "${java_bin}" ]; then
        local ver
        ver=$("${java_bin}" -version 2>&1 | head -1)
        if echo "${ver}" | grep -qE '"21(\.|")'; then
            echo "${candidate}"
            return 0
        fi
    fi
    return 1
}

_resolve_java_home() {
    # 1. Current JAVA_HOME is already Java 21?
    if [ -n "${JAVA_HOME:-}" ]; then
        if _find_java21 "${JAVA_HOME}" > /dev/null 2>&1; then
            return 0   # already correct, nothing to do
        fi
    fi

    # 2. Scan siblings of current JAVA_HOME (e.g. /c/Programs/jdk-21*)
    if [ -n "${JAVA_HOME:-}" ]; then
        local parent
        parent="$(dirname "${JAVA_HOME}")"
        for d in "${parent}"/jdk-21* "${parent}"/jdk21* "${parent}"/java-21* "${parent}"/java21*; do
            [ -d "${d}" ] || continue
            local found
            found=$(_find_java21 "${d}" 2>/dev/null) && export JAVA_HOME="${found}" && return 0
        done
    fi

    # 3. Well-known roots
    local roots=(
        "/c/Programs"
        "/c/Program Files/Java"
        "/c/Program Files/Eclipse Adoptium"
        "/c/Program Files/Microsoft"
        "/usr/lib/jvm"
        "/usr/local/lib/jvm"
        "/Library/Java/JavaVirtualMachines"
    )
    for root in "${roots[@]}"; do
        [ -d "${root}" ] || continue
        for d in "${root}"/jdk-21* "${root}"/jdk21* "${root}"/java-21* "${root}"/temurin-21* "${root}"/zulu-21*; do
            [ -d "${d}" ] || continue
            # macOS layout: Contents/Home
            local candidate="${d}"
            [ -d "${d}/Contents/Home" ] && candidate="${d}/Contents/Home"
            local found
            found=$(_find_java21 "${candidate}" 2>/dev/null) && export JAVA_HOME="${found}" && return 0
        done
    done

    # 4. System java happens to be 21?
    if command -v java > /dev/null 2>&1; then
        local ver
        ver=$(java -version 2>&1 | head -1)
        if echo "${ver}" | grep -qE '"21(\.|")'; then
            return 0
        fi
    fi

    # 5. Nothing found – warn but continue (build will likely fail with a
    #    clear Kotlin/Gradle error message pointing the user at the real issue)
    print_warning "Could not locate a Java 21 JDK. Gradle requires Java 21 due to a"
    print_warning "Kotlin DSL parser limitation with Java 25 version strings."
    print_warning "Set JAVA_HOME to a Java 21 JDK and re-run this script."
}

_resolve_java_home

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
        if [ ! -f .env.example ]; then
            print_error ".env.example not found — cannot create .env"
            exit 1
        fi
        print_warning "No .env file found. Creating from template..."
        cp .env.example .env
        print_warning "Please edit .env with your configuration before continuing"
        echo ""
    else
        print_success ".env file found"
    fi
}

# Wait for PostgreSQL to be ready using pg_isready polling.
# Avoids the fragile 'sleep 10' approach: fast on quick machines,
# reliable on slow ones (cold Docker pull, CI, etc.).
#
# Usage: wait_for_db <host> <port> <user> <db> [max_attempts]
wait_for_db() {
    local host="${1:-localhost}"
    local port="${2:-5432}"
    local user="${3:-invartek}"
    local db="${4:-invaretl}"
    local max_attempts="${5:-30}"
    local attempt=1

    echo "Waiting for PostgreSQL at ${host}:${port}..."

    until docker compose -f docker-compose.yml exec -T db \
            pg_isready -h "${host}" -p "${port}" -U "${user}" -d "${db}" \
            > /dev/null 2>&1; do
        if [ "${attempt}" -ge "${max_attempts}" ]; then
            print_error "PostgreSQL did not become ready after ${max_attempts} attempts. Giving up."
            exit 1
        fi
        echo "  attempt ${attempt}/${max_attempts} — not ready yet, retrying in 2s..."
        attempt=$(( attempt + 1 ))
        sleep 2
    done

    print_success "PostgreSQL is ready (${host}:${port})"
}

# Start development environment
start_dev() {
    echo "Starting development environment..."

    # Start database
    echo "Starting PostgreSQL database..."
    docker compose -f docker-compose.yml up -d db

    # Wait for database using pg_isready polling (replaces unreliable sleep)
    wait_for_db "localhost" "5432" "invartek" "invaretl"

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
    echo "Backend:    http://localhost:8080"
    echo "Frontend:   http://localhost:5173"
    echo "H2 Console: http://localhost:8080/h2-console"
    echo ""
    echo "Press Ctrl+C to stop all services"

    # Trap signals to clean up background processes and the database container
    trap "kill ${BACKEND_PID} ${FRONTEND_PID} 2>/dev/null; docker compose -f docker-compose.yml down; exit" INT TERM

    # Wait for background processes
    wait
}

# Run tests
run_tests() {
    echo "Running tests..."

    echo "Running backend tests..."
    ./gradlew :server:test

    echo ""
    echo "Running frontend tests..."
    cd ui
    # Use test:ci (vitest run --coverage) so the process exits after a single
    # pass and does not block in interactive watch mode.
    # Prefer the system-installed node/npm over whatever Gradle downloaded so
    # that the Node version satisfies the Vite 7 engine requirement (>=20.19).
    if command -v npm > /dev/null 2>&1; then
        npm run test:ci
    else
        print_error "npm not found on PATH – cannot run frontend tests"
        cd ..
        exit 1
    fi
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
