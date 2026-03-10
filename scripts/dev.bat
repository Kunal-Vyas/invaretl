@echo off
setlocal EnableDelayedExpansion

:: ---------------------------------------------------------------------------
:: Java 21 auto-detection
::
:: The Kotlin DSL (bundled in Gradle 8.x) cannot parse the Java 25 version
:: string, causing "IllegalArgumentException: 25.0.1" at configuration time.
:: We need a Java 21 JDK to run Gradle itself.
::
:: Strategy (first match wins):
::   1. JAVA_HOME already set and points to a Java 21 JDK  -> keep it
::   2. A sibling jdk-21* directory next to the current JAVA_HOME           -> use it
::   3. Common installation roots on Windows                                -> scan
::   4. `java -version` is already 21                                       -> keep it
::   5. Give up and let the user know what to fix
:: ---------------------------------------------------------------------------

call :resolve_java_home
goto :main

:find_java21
    set "_candidate=%~1"
    set "_java_bin=%_candidate%\bin\java.exe"
    if not exist "%_java_bin%" exit /b 1
    for /f "tokens=* usebackq" %%v in (`"%_java_bin%" -version 2^>^&1`) do (
        set "_ver=%%v"
        goto :check_ver
    )
    :check_ver
    echo !_ver! | findstr /r "\"21\." > nul 2>&1
    if !errorlevel! == 0 (
        set "JAVA_HOME=%_candidate%"
        exit /b 0
    )
    echo !_ver! | findstr /r "\"21\"" > nul 2>&1
    if !errorlevel! == 0 (
        set "JAVA_HOME=%_candidate%"
        exit /b 0
    )
    exit /b 1

:resolve_java_home
    :: 1. Current JAVA_HOME is already Java 21?
    if defined JAVA_HOME (
        call :find_java21 "%JAVA_HOME%"
        if !errorlevel! == 0 exit /b 0
    )

    :: 2. Scan siblings of current JAVA_HOME
    if defined JAVA_HOME (
        for %%d in ("%JAVA_HOME%\..\jdk-21*" "%JAVA_HOME%\..\jdk21*" "%JAVA_HOME%\..\java-21*" "%JAVA_HOME%\..\java21*") do (
            if exist "%%~fd\" (
                call :find_java21 "%%~fd"
                if !errorlevel! == 0 exit /b 0
            )
        )
    )

    :: 3. Well-known roots on Windows
    set "_roots=C:\Program Files\Java C:\Program Files\Eclipse Adoptium C:\Program Files\Microsoft C:\Programs"
    for %%r in (%_roots%) do (
        if exist "%%r\" (
            for /d %%d in ("%%r\jdk-21*" "%%r\jdk21*" "%%r\java-21*" "%%r\temurin-21*" "%%r\zulu-21*") do (
                if exist "%%~fd\" (
                    call :find_java21 "%%~fd"
                    if !errorlevel! == 0 exit /b 0
                )
            )
        )
    )

    :: 4. System java happens to be 21?
    where java > nul 2>&1
    if !errorlevel! == 0 (
        for /f "tokens=* usebackq" %%v in (`java -version 2^>^&1`) do (
            set "_sysver=%%v"
            goto :check_sys_ver
        )
        :check_sys_ver
        echo !_sysver! | findstr /r "\"21\." > nul 2>&1
        if !errorlevel! == 0 exit /b 0
        echo !_sysver! | findstr /r "\"21\"" > nul 2>&1
        if !errorlevel! == 0 exit /b 0
    )

    :: 5. Nothing found - warn but continue
    call :print_warning "Could not locate a Java 21 JDK. Gradle requires Java 21 due to a"
    call :print_warning "Kotlin DSL parser limitation with Java 25 version strings."
    call :print_warning "Set JAVA_HOME to a Java 21 JDK and re-run this script."
    exit /b 0

:: ---------------------------------------------------------------------------
:: Print helpers
:: ---------------------------------------------------------------------------
:print_success
    echo [92m^> %~1[0m
    exit /b 0

:print_error
    echo [91mX %~1[0m
    exit /b 0

:print_warning
    echo [93m! %~1[0m
    exit /b 0

:: ---------------------------------------------------------------------------
:: Check requirements
:: ---------------------------------------------------------------------------
:check_requirements
    echo Checking requirements...

    where docker > nul 2>&1
    if !errorlevel! neq 0 (
        call :print_error "Docker is not installed"
        exit /b 1
    )
    call :print_success "Docker found"

    docker compose version > nul 2>&1
    if !errorlevel! neq 0 (
        call :print_error "Docker Compose is not installed"
        exit /b 1
    )
    call :print_success "Docker Compose found"

    where java > nul 2>&1
    if !errorlevel! neq 0 (
        call :print_error "Java is not installed"
        exit /b 1
    )
    call :print_success "Java found"

    where node > nul 2>&1
    if !errorlevel! neq 0 (
        call :print_error "Node.js is not installed"
        exit /b 1
    )
    call :print_success "Node.js found"

    echo.
    exit /b 0

:: ---------------------------------------------------------------------------
:: Setup environment
:: ---------------------------------------------------------------------------
:setup_env
    if not exist ".env" (
        if not exist ".env.example" (
            call :print_error ".env.example not found — cannot create .env"
            exit /b 1
        )
        call :print_warning "No .env file found. Creating from template..."
        copy ".env.example" ".env" > nul
        call :print_warning "Please edit .env with your configuration before continuing"
        echo.
    ) else (
        call :print_success ".env file found"
    )
    exit /b 0

:: ---------------------------------------------------------------------------
:: Wait for PostgreSQL to be ready
:: ---------------------------------------------------------------------------
:wait_for_db
    set "_host=%~1"
    set "_port=%~2"
    set "_user=%~3"
    set "_db=%~4"
    set "_max=%~5"
    set "_attempt=1"

    echo Waiting for PostgreSQL at %_host%:%_port%...

    :db_poll
        docker compose -f docker-compose.yml exec -T db pg_isready -h %_host% -p %_port% -U %_user% -d %_db% > nul 2>&1
        if !errorlevel! == 0 goto :db_ready
        if !_attempt! geq %_max% (
            call :print_error "PostgreSQL did not become ready after %_max% attempts. Giving up."
            exit /b 1
        )
        echo   attempt !_attempt!/%_max% — not ready yet, retrying in 2s...
        set /a "_attempt+=1"
        timeout /t 2 /nobreak > nul
        goto :db_poll

    :db_ready
    call :print_success "PostgreSQL is ready (%_host%:%_port%)"
    exit /b 0

:: ---------------------------------------------------------------------------
:: Start development environment
:: ---------------------------------------------------------------------------
:start_dev
    echo Starting development environment...

    echo Starting PostgreSQL database...
    docker compose -f docker-compose.yml up -d db
    if !errorlevel! neq 0 (
        call :print_error "Failed to start the database container"
        exit /b 1
    )

    call :wait_for_db "localhost" "5432" "invartek" "invaretl" "30"
    if !errorlevel! neq 0 exit /b 1

    echo Starting backend...
    start "InvarETL Backend" /b cmd /c "gradlew.bat :server:bootRun 2>&1"

    echo Starting frontend...
    start "InvarETL Frontend" /b cmd /c "cd ui && npm run dev 2>&1"

    echo.
    call :print_success "Development environment started!"
    echo Backend:    http://localhost:8080
    echo Frontend:   http://localhost:5173
    echo H2 Console: http://localhost:8080/h2-console
    echo.
    echo Press Ctrl+C to stop all services (run 'dev.bat down' to stop the DB container)

    :: Keep this window alive so Ctrl+C is captured here
    :wait_loop
        timeout /t 5 /nobreak > nul
        goto :wait_loop

:: ---------------------------------------------------------------------------
:: Run tests
:: ---------------------------------------------------------------------------
:run_tests
    echo Running tests...

    echo Running backend tests...
    call gradlew.bat :server:test
    if !errorlevel! neq 0 (
        call :print_error "Backend tests failed"
        exit /b 1
    )

    echo.
    echo Running frontend tests...
    where npm > nul 2>&1
    if !errorlevel! neq 0 (
        call :print_error "npm not found on PATH - cannot run frontend tests"
        exit /b 1
    )
    pushd ui
    call npm run test:ci
    set "_npm_exit=!errorlevel!"
    popd
    if !_npm_exit! neq 0 (
        call :print_error "Frontend tests failed"
        exit /b 1
    )

    echo.
    call :print_success "All tests completed!"
    exit /b 0

:: ---------------------------------------------------------------------------
:: Build for production
:: ---------------------------------------------------------------------------
:build_prod
    echo Building for production...

    echo Building Docker image...
    docker build -t invaretl:latest .
    if !errorlevel! neq 0 (
        call :print_error "Docker build failed"
        exit /b 1
    )

    call :print_success "Production build completed!"
    exit /b 0

:: ---------------------------------------------------------------------------
:: Main dispatch
:: ---------------------------------------------------------------------------
:main
    :: Must be run from the project root (where gradlew.bat lives)
    set "_script_dir=%~dp0"
    pushd "%_script_dir%.."

    set "_cmd=%~1"
    if "%_cmd%"=="" goto :usage

    if /i "%_cmd%"=="dev"   goto :cmd_dev
    if /i "%_cmd%"=="start" goto :cmd_dev
    if /i "%_cmd%"=="test"  goto :cmd_test
    if /i "%_cmd%"=="build" goto :cmd_build
    if /i "%_cmd%"=="prod"  goto :cmd_prod
    if /i "%_cmd%"=="down"  goto :cmd_down
    if /i "%_cmd%"=="clean" goto :cmd_clean
    goto :usage

    :cmd_dev
        call :check_requirements
        if !errorlevel! neq 0 goto :end
        call :setup_env
        if !errorlevel! neq 0 goto :end
        call :start_dev
        goto :end

    :cmd_test
        call :check_requirements
        if !errorlevel! neq 0 goto :end
        call :run_tests
        goto :end

    :cmd_build
        call :check_requirements
        if !errorlevel! neq 0 goto :end
        call :build_prod
        goto :end

    :cmd_prod
        call :check_requirements
        if !errorlevel! neq 0 goto :end
        call :setup_env
        if !errorlevel! neq 0 goto :end
        echo Starting production environment...
        docker compose -f docker-compose.prod.yml up -d
        call :print_success "Production environment started!"
        goto :end

    :cmd_down
        echo Stopping all services...
        docker compose -f docker-compose.yml down 2>nul
        docker compose -f docker-compose.prod.yml down 2>nul
        call :print_success "All services stopped!"
        goto :end

    :cmd_clean
        echo Cleaning up...
        call gradlew.bat clean
        pushd ui
        call npm run clean 2>nul
        popd
        docker system prune -f
        call :print_success "Cleanup completed!"
        goto :end

:usage
    echo Usage: %~nx0 {dev^|test^|build^|prod^|down^|clean}
    echo.
    echo Commands:
    echo   dev    - Start development environment (backend + frontend + db)
    echo   test   - Run all tests
    echo   build  - Build Docker image for production
    echo   prod   - Start production environment
    echo   down   - Stop all services
    echo   clean  - Clean up build artifacts and Docker
    popd
    exit /b 1

:end
    popd
    endlocal
