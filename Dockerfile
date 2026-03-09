# Build stage for UI
FROM node:20-alpine AS ui-build
WORKDIR /ui

# Copy package files first for better caching
COPY ui/package*.json ./
# Install ALL dependencies (including devDependencies) needed for the build
# vue-tsc, vite, tailwindcss, @vitejs/plugin-vue are all devDependencies
RUN npm ci

# Copy source code
COPY ui/ ./
# Build the UI
RUN npm run build

# Build stage for Spring Boot with dependency caching
FROM gradle:8-jdk21-alpine AS backend-build
WORKDIR /app

# Copy build files first for better caching
COPY build.docker.gradle.kts build.gradle.kts
COPY settings.gradle.kts .
COPY server/build.gradle.kts server/

# Download dependencies (cached unless build files change)
RUN gradle :server:dependencies --no-daemon --write-locks

# Copy source code and pre-built UI
COPY server server
COPY --from=ui-build /ui/dist /app/server/src/main/resources/static

# Build the application
RUN gradle :server:build -x test --no-daemon

# Runtime stage with security improvements
FROM eclipse-temurin:21-jre-alpine
LABEL maintainer="invartek"
LABEL version="0.0.1"
LABEL description="InvarETL Application"

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app

# Copy the built JAR
COPY --from=backend-build /app/server/build/libs/app.jar app.jar

# Set proper ownership
RUN chown -R app:app /app

# Switch to non-root user
USER app

# Expose port
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Set JVM options
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:+UseContainerSupport"

# Entry point
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
