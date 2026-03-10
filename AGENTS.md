# InvarETL Agent Guidelines (`AGENTS.md`)

This document provides definitive instructions, architecture constraints, and style guidelines for all AI coding agents (such as OpenCode, Cursor, and GitHub Copilot) operating within the InvarETL repository. Agents must read and strictly adhere to these instructions before making code modifications.

---

## Project Overview

InvarETL is a "Project Manager in a Box" that leverages AI agents to build software. Instead of writing code, you manage Specs (requirements). The platform then handles the heavy lifting while giving you a real-time "Price Tag" for every button and feature you add.

**Application Name:** `invaretl`
**Description:** A multi-service application orchestrated with Docker Compose.
**Primary Language(s):** Java, Spring, Gradle, Node JS, VueJS, Javascript
**Repository:** [<!-- e.g., https://github.com/org/repo -->](https://github.com/Kunal-Vyas/invaretl)

---

## Repository Structure

```
.
├── docker-compose.yml          # Main Compose file
├── docker-compose.override.yml # Local dev overrides (optional)
├── docker-compose.prod.yml     # Production overrides (optional)
├── .env.example                # Example environment variables
├── AGENTS.md                   # This file
│
├── services/
│   ├── api/                    # Backend API service
│   │   ├── Dockerfile
│   │   └── src/
│   ├── worker/                 # Background worker service
│   │   ├── Dockerfile
│   │   └── src/
│   └── frontend/               # Frontend service
│       ├── Dockerfile
│       └── src/
│
├── nginx/                      # Reverse proxy config
├── scripts/                    # Helper scripts (seed, migrate, etc.)
└── volumes/                    # Persistent volume mounts (if any)
```
---

## Architecture Overview

InvarETL is designed as a multi-service application orchestrated through Docker Compose. The application consists of several interconnected services that communicate through defined networks and volumes. Each service may have its own build context and requirements.

### Docker Compose Structure

#### File Organization

- `docker-compose.yml`: Main production configuration
- `docker-compose.override.yml`: Development overrides (excluded from version control)
- `docker-compose.test.yml`: Test environment configuration
- `docker-compose.prod.yml`: Production-specific overrides
- `.docker/`: Directory containing Docker-related resources
  - Each service should have its own subdirectory with:
    - `Dockerfile`: Service-specific container definition
    - `docker-entrypoint.sh`: Service entrypoint script
    - `healthcheck.sh`: Service health check script

#### Multi-Build Strategy

Each service in the application should have a separate Docker build context to:
1. Minimize build context size
2. Enable independent service updates
3. Optimize layer caching
4. Allow service-specific build arguments

#### Service Configuration Standards

All services must follow these configuration standards:

```yaml
services:
  <service-name>:
    build:
      context: ./<service-path>
      dockerfile: Dockerfile
      args:
        - VERSION=${VERSION:-latest}
        - BUILD_NUMBER=${BUILD_NUMBER:-dev}
    image: invaretl/<service-name>:${VERSION:-latest}
    container_name: invaretl-<service-name>
    restart: unless-stopped
    networks:
      - invaretl-network
    volumes:
      - ./logs:/var/log/invaretl
    environment:
      - SERVICE_NAME=<service-name>
      - LOG_LEVEL=${LOG_LEVEL:-info}
    healthcheck:
      test: ["CMD", "healthcheck.sh"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

#### Network Configuration

All services must connect to the application network:

```yaml
networks:
  invaretl-network:
    driver: bridge
    name: invaretl-network
```

#### Volume Standards

Use named volumes for persistent data:

```yaml
volumes:
  db-data:
    driver: local
  logs:
    driver: local
  cache:
    driver: local
```

### Dockerfile Standards

#### Base Images

- Use official base images when possible
- Pin specific versions for reproducibility
- Prefer Alpine Linux variants when security is a priority

#### Layer Optimization

1. Order instructions from least to most frequently changing
2. Combine related RUN commands using `&&`
3. Use `.dockerignore` to exclude unnecessary files
4. Remove package caches after installation
5. Use multi-stage builds for production images

#### Security Practices

1. Run as non-root user
2. Do not include secrets in images
3. Scan images for vulnerabilities before deployment
4. Keep base images updated

#### Standard Dockerfile Template

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init

# Create app directory and user
WORKDIR /usr/src/app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

### Environment Configuration

#### Environment Variables

- Use `.env` files for environment-specific values
- Do not commit secrets to version control
- Use variable interpolation in docker-compose.yml
- Provide sensible defaults for all variables

#### Example `.env` Template

```env
# Application
VERSION=latest
NODE_ENV=production
LOG_LEVEL=info

# Database
DB_HOST=db
DB_PORT=5432
DB_NAME=invaretl
DB_USER=invaretl
DB_PASSWORD=${DB_PASSWORD}

# External Services
API_KEY=${API_KEY}
EXTERNAL_SERVICE_URL=${EXTERNAL_SERVICE_URL}
```

### Development Workflow

#### Local Development

1. Use `docker-compose up --build` to start the development environment
2. Mount source code volumes for live reloading
3. Use development-specific environment variables
4. Apply debug configurations when necessary

#### Testing

1. Run tests in isolated containers
2. Use docker-compose.test.yml for test environment
3. Ensure test data doesn't leak to production volumes
4. Generate test reports in mounted volumes

#### Production Deployment

1. Use specific image tags (not `latest`)
2. Set proper resource limits
3. Configure logging drivers for centralized collection
4. Enable health checks for all services
5. Use rolling updates for zero-downtime deployment

### Build Optimization

#### CI/CD Integration

1. Use Docker layer caching in CI pipelines
2. Build images in parallel when possible
3. Tag images with commit SHA for traceability
4. Push images to a private registry
5. Implement image vulnerability scanning

#### Example CI Pipeline Steps

```yaml
build:
  stage: build
  script:
    - docker compose build --parallel
    - docker compose push
  only:
    - main
    - develop
```

### Monitoring and Logging

#### Logging Standards

1. Standardize on JSON log format
2. Include service name, timestamp, and correlation ID
3. Log to stdout/stderr for container logging
4. Configure appropriate log rotation

#### Health Checks

1. Implement service-specific health check endpoints
2. Use appropriate timeouts and intervals
3. Handle graceful degradation when dependencies are unhealthy
4. Include dependency health in service health status

### Security Considerations

1. Regularly scan images for vulnerabilities
2. Use read-only filesystems where possible
3. Limit container capabilities
4. Implement secrets management
5. Use network segmentation between services
6. Apply resource limits to prevent DoS attacks

### Troubleshooting

#### Common Issues and Solutions

1. **Build Context Too Large**: Optimize `.dockerignore` file
2. **Port Conflicts**: Use dynamic port mapping in development
3. **Dependency Issues**: Use explicit versions in package files
4. **Resource Exhaustion**: Set appropriate memory/CPU limits
5. **Network Connectivity**: Verify network configuration and service discovery

#### Debugging Commands

```bash
# View logs for all services
docker compose logs

# View logs for a specific service
docker compose logs -f <service-name>

# Execute commands in a running container
docker compose exec <service-name> sh

# Inspect a service's configuration
docker compose inspect <service-name>

# Check resource usage
docker stats
```
---

## Agent-Specific Guidelines

### Before Making Changes

1. Read the existing docker-compose files to understand the current architecture
2. Check for service dependencies and relationships
3. Review environment variable requirements
4. Examine existing Dockerfiles for patterns and conventions

### Making Changes

1. Update both the service definition and its Dockerfile when applicable
2. Maintain consistency with existing service configurations
3. Add appropriate health checks for new services
4. Update the `.env.example` file with new variables
5. Document any breaking changes

### Testing Changes

1. Use `docker compose config` to validate the configuration
2. Test with `docker compose up --build` in a development environment
3. Verify all services start and pass health checks
4. Test service-to-service communication
5. Validate error handling and recovery scenarios

### Documentation

1. Update this AGENTS.md file with architectural changes
2. Document any new environment variables
3. Include examples of new service configurations
4. Update README.md with any relevant Docker changes
```

This updated AGENTS.md file provides comprehensive guidelines for working with a multi-build Docker Compose application in the invaretl project. It covers architecture standards, Dockerfile conventions, environment management, deployment strategies, and troubleshooting approaches.
