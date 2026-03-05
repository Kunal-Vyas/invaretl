# InvarETL - No-Code Data Fabric Platform

A comprehensive multi-language, multi-container data transformation platform that turns complex data pipelines into a visual, drag-and-drop experience. If you can use Canva or Zapier, you can build an enterprise-grade data pipeline.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/invartek/invaretl.git
cd invaretl

# Start development environment
./scripts/dev.sh dev
```

This will start:
- PostgreSQL database (port 5432)
- Spring Boot backend (port 8080)
- Vue.js frontend (port 5173)
- H2 Console (http://localhost:8080/h2-console)

## 📋 Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vite 7** - Fast build tool
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework

### Backend
- **Spring Boot 3.2** - Java application framework
- **Java 21** - Latest LTS Java version
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database abstraction
- **H2/PostgreSQL** - Database engines

### DevOps & CI/CD
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD pipeline
- **Gradle** - Build automation

## 🛠️ Development

### Prerequisites
- Java 21+
- Node.js 20+
- Docker & Docker Compose
- Gradle 8+

### Local Development

#### Using the convenience script (Recommended):
```bash
./scripts/dev.sh dev
```

#### Manual setup:
```bash
# Start database
docker compose -f docker-compose.yml up -d db

# Start backend (terminal 1)
./gradlew :server:bootRun

# Start frontend (terminal 2)
cd ui && npm run dev
```

### Testing
```bash
# Run all tests
./scripts/dev.sh test

# Or separately:
./gradlew test              # Backend tests
cd ui && npm test            # Frontend tests
```

## 🐳 Docker & Deployment

### Development Environment
```bash
docker compose -f docker-compose.yml up -d
```

### Production Environment
```bash
# Copy environment template
cp .env.example .env
# Edit .env with your configuration

# Start production stack
docker compose -f docker-compose.prod.yml up -d
```

### Build Docker Image
```bash
docker build -t invaretl:latest .
```

## 🌍 Environment Configuration

The application supports multiple profiles:

- **dev** (default): Development with H2 database
- **prod**: Production with PostgreSQL
- **test**: Test environment with isolated H2

## 📊 Architecture

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend  │    │    Backend   │    │  Database    │
│  (Vue 3)   │────│ (Spring Boot)│────│ (PostgreSQL) │
│ Port: 5173 │    │  Port: 8080  │    │ Port: 5432   │
└─────────────┘    └──────────────┘    └──────────────┘
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_PROFILES_ACTIVE` | dev | Active Spring profile |
| `DATABASE_URL` | - | JDBC database URL |
| `POSTGRES_DB` | invaretl | Database name |
| `POSTGRES_USER` | invartek | Database user |
| `POSTGRES_PASSWORD` | - | Database password |

## 📝 Project Structure

```
invaretl/
├── server/                    # Spring Boot backend
│   ├── src/
│   │   ├── main/             # Main application code
│   │   └── test/             # Test code
│   └── build.gradle.kts       # Backend build configuration
├── ui/                       # Vue.js frontend
│   ├── src/                  # Vue source code
│   ├── public/               # Static assets
│   └── package.json         # Frontend dependencies
├── scripts/                  # Utility scripts
│   ├── dev.sh              # Development helper
│   └── init-db.sh         # Database initialization
├── docs/                     # Documentation
├── Dockerfile               # Multi-stage Docker build
├── docker-compose.yml       # Development environment
├── docker-compose.prod.yml  # Production environment
└── build.gradle.kts         # Root build configuration
```

## 🔄 CI/CD Pipeline

The project includes a complete CI/CD pipeline:

1. **Test Phase**:
   - Backend unit tests with JUnit
   - Frontend unit tests with Vitest
   - Code coverage reporting

2. **Build Phase**:
   - Multi-platform Docker builds
   - Automated image tagging
   - Push to Docker Hub

3. **Deploy Phase**:
   - Production deployment hooks
   - Health checks
   - Monitoring setup

## 📋 Available Scripts

```bash
./scripts/dev.sh <command>
  dev     - Start development environment
  test    - Run all tests
  build   - Build Docker image
  prod     - Start production environment
  down    - Stop all services
  clean   - Clean up artifacts
```

## 🛡️ Security Features

- Non-root user in production containers
- Environment-based configuration
- Health checks and monitoring
- Database authentication
- Spring Security integration

## 📈 Performance Optimizations

- Docker multi-stage builds
- Frontend code splitting
- Database connection pooling
- Caching strategies
- Optimized Docker layers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Check environment variables in .env
   - Ensure PostgreSQL is running

2. **Port conflicts**:
   - Check if ports 5173, 8080, 5432 are free
   - Modify ports in docker-compose files

3. **Build failures**:
   - Clear Docker cache: `docker system prune`
   - Update dependencies: `./gradlew build --refresh-dependencies`

### Health Checks

- Application health: `curl http://localhost:8080/actuator/health`
- Database health: `docker compose ps`

## 📚 Documentation

- [Build Setup Guide](docs/BUILD_SETUP.md) - Detailed build configuration
- [API Documentation](http://localhost:8080/swagger-ui.html) - When running
- [H2 Console](http://localhost:8080/h2-console) - Development database
