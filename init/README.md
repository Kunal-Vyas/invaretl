# Superheroes Database Initialization

This directory contains SQL scripts to initialize a MariaDB database with sample data about superheroes.

## Database Overview

The superheroes database is a comprehensive dataset containing information about 750+ superheroes from various publishers including Marvel Comics, DC Comics, and others. The database includes:

- **Superheroes**: Complete profiles with physical attributes, publishers, and alignments
- **Attributes**: Six key attributes (Intelligence, Strength, Speed, Durability, Power, Combat) rated 0-100
- **Superpowers**: 167 different superpowers and abilities
- **Reference Data**: Gender, alignment, race, publisher, and color information

## Database Schema

### Tables

1. **alignment** - Good, Bad, Neutral classifications
2. **attribute** - Six superhero attributes (Intelligence, Strength, etc.)
3. **colour** - Eye, hair, and skin colors
4. **gender** - Male, Female, N/A
5. **publisher** - Comic publishers (Marvel, DC, etc.)
6. **race** - Superhero races (Human, Kryptonian, Mutant, etc.)
7. **superhero** - Main table with superhero information
8. **superpower** - List of all superpowers
9. **hero_attribute** - Junction table linking superheroes to their attribute values
10. **hero_power** - Junction table linking superheroes to their superpowers

### ERD Relationships

- superhero → alignment (many-to-one)
- superhero → gender (many-to-one)
- superhero → publisher (many-to-one)
- superhero → race (many-to-one)
- superhero → colour (multiple foreign keys for eye, hair, skin)
- superhero ↔ attribute (many-to-many via hero_attribute)
- superhero ↔ superpower (many-to-many via hero_power)

## SQL Files

The database initialization is split into three files that should be executed in order:

1. **01_reference_data.sql** (50KB)
   - Creates database structure
   - Loads reference tables (alignment, attribute, colour, gender, publisher, race)
   - Loads all 756 superhero records with their basic information

2. **02_hero_attribute.sql** (44KB)
   - Creates hero_attribute table
   - Loads attribute ratings for all superheroes

3. **03_hero_power.sql** (57KB)
   - Creates superpower and hero_power tables
   - Loads all superpowers and hero-power associations

4. **init_mariadb_complete.sql** (150KB)
   - Combined file containing all three scripts above

## Usage with Docker Compose

The docker-compose.yml file is configured to automatically initialize the database when the MariaDB container starts for the first time. The SQL files in this directory are mounted to `/docker-entrypoint-initdb.d/` in the container.

### Starting the Database

```bash
docker-compose up -d
```

### Connecting to the Database

```bash
# Using docker exec
docker exec -it invar-test-mariadb mariadb -u ${MARIADB_USER} -p ${MARIADB_DATABASE}

# Using MySQL client
mysql -h localhost -P 3306 -u ${MARIADB_USER} -p ${MARIADB_DATABASE}
```

### Environment Variables

Configure the following in your `.env` file:
- `MARIADB_ROOT_PASSWORD` - Root password
- `MARIADB_DATABASE` - Database name (default: testdb)
- `MARIADB_USER` - Username (default: testuser)
- `MARIADB_PASSWORD` - User password

## Sample Queries

### Find all Marvel superheroes
```sql
SELECT s.superhero_name, s.full_name, p.publisher_name
FROM superhero s
INNER JOIN publisher p ON s.publisher_id = p.id
WHERE p.publisher_name = 'Marvel Comics';
```

### Get superheroes with their total attribute score
```sql
SELECT 
  s.id,
  s.superhero_name,
  p.publisher_name,
  SUM(ha.attribute_value) AS total_attributes
FROM superhero s
INNER JOIN publisher p ON s.publisher_id = p.id
LEFT JOIN hero_attribute ha ON s.id = ha.hero_id
GROUP BY s.id, s.superhero_name, p.publisher_name
ORDER BY total_attributes DESC
LIMIT 20;
```

### Find superheroes with specific superpowers
```sql
SELECT s.superhero_name, sp.power_name
FROM superhero s
INNER JOIN hero_power hp ON s.id = hp.hero_id
INNER JOIN superpower sp ON hp.power_id = sp.id
WHERE sp.power_name IN ('Flight', 'Super Strength', 'Telepathy')
ORDER BY s.superhero_name;
```

### Compare DC vs Marvel average attributes
```sql
SELECT 
  p.publisher_name,
  AVG(ha.attribute_value) AS avg_attribute_value,
  COUNT(DISTINCT s.id) AS hero_count
FROM superhero s
INNER JOIN publisher p ON s.publisher_id = p.id
LEFT JOIN hero_attribute ha ON s.id = ha.hero_id
WHERE p.publisher_name IN ('Marvel Comics', 'DC Comics')
GROUP BY p.publisher_name;
```

## Data Source

This dataset is from Database Star:
- Website: https://www.databasestar.com/sample-database-superheroes/
- GitHub: https://github.com/bbrumm/databasestar
- License: Available for educational and practice purposes

## Notes

- Not all superheroes have complete attribute or superpower data
- The dataset includes superheroes from comics, movies, TV shows, and other media
- Some superhero names appear multiple times (e.g., different people who took on the same superhero identity)
- Height is stored in centimeters, weight in kilograms

## Database Statistics

- **Total Superheroes**: 756
- **Total Superpowers**: 167
- **Publishers**: 25
- **Races**: 61
- **Colors**: 35
- **Hero-Power Associations**: ~7,500+
- **Hero-Attribute Records**: ~4,500+
