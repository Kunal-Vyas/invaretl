# Stage 1: Build the application
FROM gradle:8.5-jdk21 AS build

# Set working directory
WORKDIR /mcp

# Copy Gradle wrapper and build files
COPY gradlew .
COPY gradlew.bat .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Download dependencies (this layer will be cached if dependencies don't change)
RUN gradle dependencies --no-daemon

# Copy source code
COPY src src

# Build the application
RUN gradle build --no-daemon -x test

# Stage 2: Create the runtime image
FROM eclipse-temurin:21-jre-jammy

# Set working directory
WORKDIR /mcp

# Create a non-root user to run the application
RUN groupadd -r spring && useradd -r -g spring spring

# Copy the built JAR from the build stage
COPY --from=build /mcp/build/libs/*.jar mcp.jar

# Change ownership to the non-root user
RUN chown -R spring:spring /mcp

# Switch to non-root user
USER spring

# Expose the default Spring Boot port
EXPOSE 8080

# Set JVM options for containerized environments
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"

# Health check
#HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
#CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar mcp.jar"]
