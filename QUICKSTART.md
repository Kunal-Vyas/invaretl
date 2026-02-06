# Quick Start Guide - Superheroes Database

This guide will help you quickly set up and start using the MariaDB superheroes database.

## Prerequisites

- Docker and Docker Compose installed
- Basic knowledge of SQL

## Setup Steps

### 1. Clone and Navigate to Project

```bash
cd invaretl
```

### 2. Create Environment File

Create a `.env` file in the project root:

```bash
# .env file
MARIADB_ROOT_PASSWORD=strongrootpassword
MARIADB_DATABASE=superhero
MARIADB_USER=superherouser
MARIADB_PASSWORD=superheropass
```

### 3. Start the Database

```bash
docker-compose up -d
```

This will:
- Pull the MariaDB image
- Create and start the container
- Automatically initialize the database with superhero data
- The first startup may take 1-2 minutes to load all data

### 4. Verify the Database is Running

```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs test-mariadb
```

### 5. Connect to the Database

#### Option A: Using Docker Exec

```bash
docker exec -it invar-test-mariadb mariadb -u superherouser -p superhero
# Enter password: superheropass
```

#### Option B: Using MySQL Client (if installed locally)

```bash
mysql -h localhost -P 3306 -u superherouser -p superhero
```

#### Option C: Using a GUI Tool

- **Host**: localhost
- **Port**: 3306
- **Database**: superhero
- **Username**: superherouser
- **Password**: superheropass

Tools: MySQL Workbench, DBeaver, HeidiSQL, phpMyAdmin

## Quick Test Queries

Once connected, try these queries:

### 1. Count Total Superheroes

```sql
SELECT COUNT(*) as total_heroes FROM superhero;
```

Expected result: ~756 heroes

### 2. List Top 10 Superheroes by Name

```sql
SELECT superhero_name, full_name, alignment_id 
FROM superhero 
LIMIT 10;
```

### 3. Find Spider-Man's Details

```sql
SELECT 
    s.superhero_name,
    s.full_name,
    g.gender,
    p.publisher_name,
    a.alignment,
    r.race
FROM superhero s
LEFT JOIN gender g ON s.gender_id = g.id
LEFT JOIN publisher p ON s.publisher_id = p.id
LEFT JOIN alignment a ON s.alignment_id = a.id
LEFT JOIN race r ON s.race_id = r.id
WHERE s.superhero_name = 'Spider-Man';
```

### 4. Get Spider-Man's Superpowers

```sql
SELECT 
    s.superhero_name,
    sp.power_name
FROM superhero s
INNER JOIN hero_power hp ON s.id = hp.hero_id
INNER JOIN superpower sp ON hp.power_id = sp.id
WHERE s.superhero_name = 'Spider-Man'
ORDER BY sp.power_name;
```

### 5. Top 10 Strongest Superheroes

```sql
SELECT 
    s.superhero_name,
    p.publisher_name,
    SUM(ha.attribute_value) as total_power
FROM superhero s
INNER JOIN publisher p ON s.publisher_id = p.id
LEFT JOIN hero_attribute ha ON s.id = ha.hero_id
GROUP BY s.id, s.superhero_name, p.publisher_name
ORDER BY total_power DESC
LIMIT 10;
```

### 6. Most Common Superpowers

```sql
SELECT 
    sp.power_name,
    COUNT(hp.hero_id) as hero_count
FROM superpower sp
INNER JOIN hero_power hp ON sp.id = hp.power_id
GROUP BY sp.id, sp.power_name
ORDER BY hero_count DESC
LIMIT 10;
```

### 7. Marvel vs DC Stats

```sql
SELECT 
    p.publisher_name,
    COUNT(DISTINCT s.id) as hero_count,
    ROUND(AVG(ha.attribute_value), 2) as avg_attribute
FROM superhero s
INNER JOIN publisher p ON s.publisher_id = p.id
LEFT JOIN hero_attribute ha ON s.id = ha.hero_id
WHERE p.publisher_name IN ('Marvel Comics', 'DC Comics')
GROUP BY p.publisher_name;
```

## Database Schema Overview

### Main Tables

- **superhero** - Core table with 756+ heroes
- **superpower** - 167 different powers
- **attribute** - 6 core attributes (Intelligence, Strength, Speed, Durability, Power, Combat)
- **publisher** - Comic book publishers
- **alignment** - Good, Bad, Neutral, N/A

### Junction Tables

- **hero_power** - Maps heroes to their powers (many-to-many)
- **hero_attribute** - Maps heroes to attribute ratings (many-to-many)

### Reference Tables

- **gender** - Male, Female, N/A
- **race** - 61 different races (Human, Mutant, Kryptonian, etc.)
- **colour** - For eyes, hair, and skin

## Stopping the Database

```bash
# Stop the container
docker-compose stop

# Stop and remove the container (data persists in volume)
docker-compose down

# Stop and remove everything including data
docker-compose down -v
```

## Resetting the Database

If you need to reset the database:

```bash
# Remove everything
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Troubleshooting

### Database not initializing

Check logs:
```bash
docker-compose logs test-mariadb
```

### Connection refused

- Ensure container is running: `docker-compose ps`
- Wait for health check: `docker-compose logs test-mariadb | grep "ready for connections"`
- Check port 3306 is not already in use

### Forgot password

Reset by:
```bash
docker-compose down -v
# Edit .env file with new credentials
docker-compose up -d
```

## Next Steps

- Explore the database schema in `init/README.md`
- Try writing complex queries joining multiple tables
- Practice ETL operations using this as source data
- Build dashboards or visualizations with the data

## Resources

- Full documentation: `init/README.md`
- Sample queries: See README examples
- Data source: https://www.databasestar.com/sample-database-superheroes/
- ERD: Available at the Database Star website

## Support

For issues or questions:
1. Check the logs: `docker-compose logs`
2. Review the documentation in `init/README.md`
3. Verify environment variables in `.env`
4. Ensure Docker daemon is running

Happy querying! 🦸‍♂️🦸‍♀️
