# InvarETL - No-Code Data Fabric Platform

InvarETL is a A comprehensive multi-language, multi-container data transformation platform that turns complex data pipelines into a visual, drag-and-drop experience. It works as a "Project Manager in a Box" that leverages AI agents to build data applications. Instead of writing code, you manage Specs (requirements). The platform then handles the heavy lifting while giving you a real-time "Price Tag" for every data transformation and feature you add.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/invartek/invaretl.git
cd invaretl

# Copy environment template and fill in your values
cp .env.example .env

# Start development environment
./scripts/dev.sh dev
```

This will start:
- PostgreSQL database (port 5432)
- Spring Boot backend (port 8080)
- Vue.js frontend (port 5173)

Once running, open:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080
- **H2 Console:** http://localhost:8080/h2-console (dev profile only)

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

| Tool | Required version | Notes |
|------|-----------------|-------|
| **Java** | 21 (exactly) | The Gradle Kotlin DSL bundled in Gradle 8.x cannot parse Java 22+ version strings. Install a JDK 21 and ensure `JAVA_HOME` points to it, or let the script auto-detect it. |
| **Node.js** | ≥ 20.19 | Vite 7 and several frontend dependencies require Node 20.19+. Node 24 LTS works fine. |
| **npm** | ≥ 10.8 | Bundled with Node 20.19+. |
| **Docker** | any recent | Required for the PostgreSQL container. |
| **Docker Compose** | v2 (`docker compose`) | The script uses the `docker compose` (v2) subcommand, not the standalone `docker-compose` binary. |

### Environment file

The application reads secrets and connection strings from a `.env` file in the project root. Create it before starting anything:

```bash
cp .env.example .env
# Open .env and set at least POSTGRES_PASSWORD
```

The `.env` file is git-ignored and never committed.

### Local Development

#### Using the convenience script (recommended)

```bash
./scripts/dev.sh dev
```

The script will:
1. Check that Docker, Java, and Node are available.
2. Auto-detect a Java 21 JDK and set `JAVA_HOME` if needed.
3. Create `.env` from `.env.example` if it does not exist yet.
4. Start the PostgreSQL container and poll until it is ready.
5. Start the Spring Boot backend (`./gradlew :server:bootRun`) in the background.
6. Start the Vite dev server (`npm run dev` inside `ui/`) in the background.
7. Print the service URLs and block until you press **Ctrl+C**, which cleanly shuts everything down.

#### Manual setup (three terminals)

```bash
# Terminal 1 – database
docker compose -f docker-compose.yml up -d db

# Terminal 2 – backend (requires Java 21 on JAVA_HOME)
JAVA_HOME=/path/to/jdk-21 ./gradlew :server:bootRun

# Terminal 3 – frontend
cd ui && npm run dev
```

### Testing

```bash
# Run all tests (backend + frontend) via the script
./scripts/dev.sh test

# Run separately:
JAVA_HOME=/path/to/jdk-21 ./gradlew :server:test   # Backend (JUnit)
cd ui && npm run test:ci                             # Frontend (Vitest + coverage)
```

> **Note on `JAVA_HOME`:** `./scripts/dev.sh` auto-detects a Java 21 JDK, so you do not need to set it manually when using the script. For direct `./gradlew` invocations, set `JAVA_HOME` explicitly if your shell's default Java is not 21.

## 🐳 Docker & Deployment

### Development Environment
```bash
# Database only (the script starts backend and frontend natively)
docker compose -f docker-compose.yml up -d db
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

The application supports multiple Spring profiles:

| Profile | Database | When used |
|---------|----------|-----------|
| `dev` (default) | H2 in-memory | Local development via `bootRun` |
| `test` | H2 in-memory | Automated tests (`./gradlew :server:test`) |
| `prod` | PostgreSQL | Docker / production deployment |

The active profile is controlled by `SPRING_PROFILES_ACTIVE` in `.env` or the `docker-compose` files.

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

### Java version errors (`IllegalArgumentException: 25.0.1`)

The Kotlin DSL bundled in Gradle 8.x cannot parse Java 22+ version strings. If you see this error when running `./gradlew` directly, set `JAVA_HOME` to a Java 21 JDK:

```bash
export JAVA_HOME=/path/to/jdk-21
./gradlew :server:test
```

`./scripts/dev.sh` auto-detects a Java 21 JDK and handles this for you.

### Node.js engine warnings / Vite build failure

Vite 7 requires Node **≥ 20.19**. If you see `crypto.hash is not a function` or `EBADENGINE` warnings, upgrade Node:

```bash
node --version   # must be >= 20.19
```

### Missing `.env` file

Running `./scripts/dev.sh dev` or `prod` without a `.env` will auto-create one from `.env.example`, then pause with a warning. Fill in at minimum `POSTGRES_PASSWORD` before continuing.

### Database connection errors

```bash
# Check the container is running and healthy
docker compose ps

# Tail PostgreSQL logs
docker compose logs -f db
```

### Port conflicts

If ports 5173, 8080, or 5432 are already in use:
- Override `APP_PORT` and `DB_PORT` in `.env`
- Or stop the conflicting process before starting

### Stale build artifacts

```bash
./scripts/dev.sh clean          # wipes Gradle outputs, node_modules, Docker images
./gradlew :server:test --rerun  # force a full test re-run without cleaning
```

### Health Checks

```bash
curl http://localhost:8080/actuator/health   # application liveness
docker compose ps                            # container status
```

## 📚 Documentation

- [Build Setup Guide](docs/BUILD_SETUP.md) - Detailed build configuration
- [API Documentation](http://localhost:8080/swagger-ui.html) - When running
- [H2 Console](http://localhost:8080/h2-console) - Development database
