# InvarETL Agent Roles & Responsibilities

## Overview
InvarETL is a multi-build application designed as a "No-Code Data Fabric". It consists of a high-performance Spring Boot backend and a reactive Vue JS frontend, orchestrated as a cohesive unit.

---

## 1. Backend Agent (Spring Boot Specialist)
*   **Tech Stack:** Java 21, Spring Boot 3.x, Gradle (Kotlin DSL), Spring Data JPA, Spring Security.
*   **Domain:** `/server`
*   **Core Responsibilities:**
    *   Implementing the ETL engine and data transformation logic.
    *   Designing RESTful APIs for the "No-Code" designer.
    *   Managing persistence with PostgreSQL/H2 and migrations.
    *   Ensuring type safety and performance using Java 21 features (Virtual Threads, Pattern Matching).

## 2. Frontend Agent (Vue JS Specialist)
*   **Tech Stack:** Vue 3 (Composition API), Vite, TypeScript, npm, Pinia, Tailwind CSS.
*   **Domain:** `/ui`
*   **Core Responsibilities:**
    *   Developing the visual drag-and-drop pipeline designer.
    *   Managing complex client-side state for real-time feedback.
    *   Integrating with the Backend via TypeScript-safe API clients.
    *   Building a modern, responsive UI focused on user experience.

## 3. Build & Orchestration Agent
*   **Tech Stack:** Gradle Multi-module, Docker, Docker Compose, GitHub Actions.
*   **Domain:** Root Directory (`/`)
*   **Core Responsibilities:**
    *   Managing the root `build.gradle.kts` to coordinate both modules.
    *   Providing a "Single Command Build" (e.g., `./gradlew build` packages both UI and Server).
    *   Containerizing the application for consistent deployment.
    *   Handling environment-specific configurations (.env, application.yml).

---

## Collaboration Protocol
1.  **Contract-First Development:** Define API endpoints and DTOs before starting implementation.
2.  **Shared Types:** Maintain a synchronization strategy between Java DTOs and TypeScript Interfaces.
3.  **Local Development:**
    *   Backend runs on port `8080`.
    *   Frontend runs on port `5173` (Vite) with proxying enabled to `8080`.
