# InvarETL Multi-Build Setup

This document explains the multi-build setup for the InvarETL project.

## Architecture Overview

The project uses a hybrid build approach with:
- **Frontend**: Vue 3 + Vite + TypeScript + Tailwind CSS
- **Backend**: Spring Boot 3 + Java 21 + Gradle
- **Database**: H2 (dev) / PostgreSQL (prod)
- **Containerization**: Docker with multi-stage builds

## Build Processes

### Local Development

1. **Backend Development**:
   ```bash
   ./gradlew :server:bootRun
   ```

2. **Frontend Development**:
   ```bash
   cd ui
   npm run dev
   ```

3. **Full Stack Development** (recommended):
   ```bash
   # Start database
   docker compose -f docker-compose.yml up -d db
   
   # Run backend in one terminal
   ./gradlew :server:bootRun
   
   # Run frontend in another terminal
   cd ui && npm run dev
   ```

### Production Build

1. **Docker Build**:
   ```bash
   docker build -t invaretl .
   ```

2. **Docker Compose Production**:
   ```bash
   # Copy .env.example to .env and configure
   cp .env.example .env
   
   # Start production stack
   docker compose -f docker-compose.prod.yml up -d
   ```

### Testing

1. **Backend Tests**:
   ```bash
   ./gradlew test
   ```

2. **Frontend Tests**:
   ```bash
   cd ui
   npm test
   npm run test:coverage
   ```

## Environment Configurations

The application supports multiple profiles:

### Development Profile (`dev`)
- Uses in-memory H2 database
- H2 console enabled at `/h2-console`
- SQL logging enabled
- Auto DDL updates

### Production Profile (`prod`)
- Uses PostgreSQL database
- No SQL logging
- H2 console disabled
- Database connection configured via environment variables

### Test Profile (`test`)
- Uses in-memory H2 database with PostgreSQL compatibility mode
- Database created and dropped for each test
- SQL logging enabled

## Docker Architecture

The Docker build uses multi-stage approach:

1. **Stage 1: UI Build**
   - Builds the Vue frontend
   - Optimizes assets
   - Outputs to `/ui/dist`

2. **Stage 2: Backend Build**
   - Downloads dependencies
   - Builds Spring Boot application
   - Copies UI assets into JAR

3. **Stage 3: Runtime**
   - Minimal JRE image
   - Non-root user
   - Health checks
   - Optimized for production

## CI/CD Pipeline

The project includes a complete CI/CD pipeline (`.github/workflows/ci.yml`):

1. **Test Phase**:
   - Backend unit tests
   - Frontend unit tests
   - Code coverage reporting

2. **Build Phase**:
   - Multi-platform Docker build
   - Push to Docker Hub
   - Semantic version tagging

3. **Deploy Phase**:
   - Production deployment hooks
   - Health checks
   - Rollback capabilities

## Key Files

| File | Purpose |
|------|---------|
| `build.gradle.kts` | Main build configuration (local dev) |
| `build.docker.gradle.kts` | Simplified build config for Docker |
| `Dockerfile` | Multi-stage Docker build |
| `docker-compose.yml` | Development environment |
| `docker-compose.prod.yml` | Production environment |
| `.github/workflows/ci.yml` | CI/CD pipeline |
| `ui/vite.config.ts` | Frontend build configuration |
| `ui/package.json` | Frontend dependencies and scripts |

## Common Issues and Solutions

### PostgreSQL Connection Errors
Ensure you have the correct environment variables:
```bash
DATABASE_URL=jdbc:postgresql://db:5432/invaretl
POSTGRES_USER=invartek
POSTGRES_PASSWORD=your_password
```

### Frontend Proxy Errors
The frontend proxy is configured to route `/api/*` to the backend. Make sure the backend is running on port 8080.

### Docker Build Failures
Clear Docker cache if needed:
```bash
docker builder prune -f
```

## Security Considerations

1. **Database Security**:
   - Use strong passwords in production
   - Enable SSL for database connections
   - Limit database network access

2. **Application Security**:
   - Non-root user in containers
   - Health checks enabled
   - Secrets managed via environment variables

3. **API Security**:
   - Spring Security configured
   - Actuator endpoints limited
   - CORS configured appropriately

## Performance Optimizations

1. **Frontend**:
   - Code splitting enabled
   - Lazy loading for routes
   - Asset optimization

2. **Backend**:
   - Database connection pooling
   - Caching headers
   - GZIP compression

3. **Docker**:
   - Multi-stage builds reduce image size
   - Layer caching for faster builds
   - Minimal runtime image