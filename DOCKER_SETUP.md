# Docker Development Environment Setup

Complete Docker-based development environment for AI Marketplace with PostgreSQL, Redis, and management tools.

## Quick Start

```bash
# Initialize environment (first time only)
make init

# Start all services including Adminer
make up

# Start core services only (DB + Redis)
make up-core

# Check service health
make health

# View logs
make logs
```

## Services

### PostgreSQL (Database)
- **Port**: 5432
- **User**: ai_marketplace
- **Password**: dev_password_change_in_prod
- **Database**: ai_marketplace
- **Version**: PostgreSQL 15 Alpine

**Features**:
- Persistent volume storage
- Health checks
- Auto-initialization scripts
- UUID and crypto extensions enabled

### Redis (Cache)
- **Port**: 6379
- **Version**: Redis 7 Alpine
- **Max Memory**: 256MB
- **Eviction Policy**: allkeys-lru

**Features**:
- AOF persistence
- Automatic snapshots
- Health checks
- Optimized for development

### Adminer (Database UI)
- **Port**: 8080
- **URL**: http://localhost:8080
- **Profile**: tools (optional)

**Login Credentials**:
- System: PostgreSQL
- Server: postgres
- Username: ai_marketplace
- Password: dev_password_change_in_prod
- Database: ai_marketplace

## Makefile Commands

### Basic Operations

```bash
make help          # Show all available commands
make up            # Start all services with Adminer
make up-core       # Start only DB and Redis
make down          # Stop all services
make restart       # Restart all services
make status        # Show service status
make health        # Check health of all services
```

### Logs & Monitoring

```bash
make logs          # Tail all service logs
make logs-db       # PostgreSQL logs only
make logs-redis    # Redis logs only
```

### Database Operations

```bash
make db-shell      # Access PostgreSQL CLI
make db-backup     # Create database backup
make db-restore FILE=backup.sql  # Restore from backup
```

### Redis Operations

```bash
make redis-shell   # Access Redis CLI
make redis-flush   # Clear all Redis data (DANGEROUS)
```

### Cleanup

```bash
make clean         # Remove containers, keep volumes
make reset         # Remove everything including data (DANGEROUS)
```

### Tools

```bash
make adminer       # Open Adminer in browser
make init          # Initialize complete environment
```

## Directory Structure

```
AI_marketplace/
├── docker/
│   └── init-scripts/
│       └── 01-init-database.sql    # Database initialization
├── backups/                         # Database backups
├── docker-compose.yml              # Docker services configuration
├── Makefile                        # Convenient commands
├── .env                            # Environment variables (create from .env.example)
├── .env.example                    # Environment template
├── .dockerignore                   # Docker ignore patterns
└── DOCKER_SETUP.md                 # This file
```

## Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

**Key Variables**:

```env
# Database
DB_USER=ai_marketplace
DB_PASSWORD=dev_password_change_in_prod
DB_NAME=ai_marketplace
DB_PORT=5432

# Redis
REDIS_PORT=6379

# Adminer
ADMINER_PORT=8080
```

## Database Schema

The database is automatically initialized with:

- **Extensions**: uuid-ossp, pgcrypto
- **Tables**: users, ai_agents, transactions, reviews
- **Indexes**: Optimized for common queries
- **Triggers**: Auto-update timestamps

### Tables Overview

**users**
- Authentication and user management
- Roles: admin, seller, user

**ai_agents**
- AI agent marketplace listings
- Pricing, categories, ratings

**transactions**
- Payment processing
- Stripe integration ready

**reviews**
- Agent ratings and reviews
- 1-5 star system

## Development Workflow

### 1. Initial Setup

```bash
# Initialize environment
make init

# Verify services are healthy
make health

# Check service status
make status
```

### 2. Daily Development

```bash
# Start services
make up-core

# View logs
make logs

# Access database
make db-shell

# Stop when done
make down
```

### 3. Database Management

```bash
# Create backup before changes
make db-backup

# Access Adminer for visual management
make adminer

# Execute SQL directly
make db-shell
\dt  # List tables
\d users  # Describe users table
```

### 4. Troubleshooting

```bash
# Check service health
make health

# View detailed logs
make logs-db
make logs-redis

# Reset everything (last resort)
make reset
make init
```

## Connection Strings

### Application Configuration

**PostgreSQL**:
```
postgresql://ai_marketplace:dev_password_change_in_prod@localhost:5432/ai_marketplace
```

**Redis**:
```
redis://localhost:6379
```

### Example Code

**Node.js (PostgreSQL)**:
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  user: 'ai_marketplace',
  host: 'localhost',
  database: 'ai_marketplace',
  password: 'dev_password_change_in_prod',
  port: 5432,
});
```

**Node.js (Redis)**:
```javascript
const redis = require('redis');

const client = redis.createClient({
  socket: {
    host: 'localhost',
    port: 6379,
  }
});
```

**Python (PostgreSQL)**:
```python
import psycopg2

conn = psycopg2.connect(
    dbname="ai_marketplace",
    user="ai_marketplace",
    password="dev_password_change_in_prod",
    host="localhost",
    port="5432"
)
```

**Go (PostgreSQL)**:
```go
import "database/sql"
import _ "github.com/lib/pq"

connStr := "postgresql://ai_marketplace:dev_password_change_in_prod@localhost:5432/ai_marketplace?sslmode=disable"
db, err := sql.Open("postgres", connStr)
```

## Data Persistence

**Volumes**:
- `ai_marketplace_postgres_data` - PostgreSQL data
- `ai_marketplace_redis_data` - Redis snapshots

**Backup Location**:
- `./backups/` - Database SQL backups

**Data Survival**:
- `make down` - Data persists
- `make clean` - Data persists
- `make reset` - Data is deleted

## Health Checks

Services include health checks:

- **PostgreSQL**: `pg_isready` check every 10s
- **Redis**: `PING` command every 10s

View health status:
```bash
make health
```

Or via Docker:
```bash
docker-compose ps
```

## Performance Optimization

### PostgreSQL
- Configured indexes for common queries
- Auto-vacuum enabled
- Connection pooling recommended

### Redis
- LRU eviction policy
- 256MB max memory
- AOF persistence with fsync=everysec

## Security Considerations

**Development Only**:
- Default credentials are for development
- Change all passwords in production
- Use secrets management for production
- Enable SSL/TLS for production

**Production Checklist**:
- [ ] Change all default passwords
- [ ] Use environment-specific secrets
- [ ] Enable SSL for PostgreSQL
- [ ] Configure Redis authentication
- [ ] Restrict network access
- [ ] Regular backups
- [ ] Monitor logs

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :5432
lsof -i :6379
lsof -i :8080

# Change port in .env
DB_PORT=5433
REDIS_PORT=6380
ADMINER_PORT=8081
```

### Permission Denied

```bash
# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
newgrp docker

# macOS - restart Docker Desktop
```

### Database Connection Refused

```bash
# Check if PostgreSQL is healthy
make health

# View logs
make logs-db

# Restart services
make restart
```

### Cannot Connect to Redis

```bash
# Check Redis health
docker-compose exec redis redis-cli ping

# View logs
make logs-redis

# Flush and restart
make redis-flush
make restart
```

### Data Lost After Restart

```bash
# Volumes might have been removed
# Check if volumes exist
docker volume ls | grep ai_marketplace

# If missing, reinitialize
make init
```

## Advanced Usage

### Custom Initialization Scripts

Add SQL files to `docker/init-scripts/`:

```bash
# Files are executed in alphabetical order
docker/init-scripts/
├── 01-init-database.sql      # Schema
├── 02-seed-data.sql          # Test data
└── 03-development-users.sql  # Dev users
```

### Multiple Environments

```bash
# Development
docker-compose up -d

# Testing
docker-compose -f docker-compose.test.yml up -d

# Production (not recommended, use managed services)
docker-compose -f docker-compose.prod.yml up -d
```

### Custom Network Configuration

Edit `docker-compose.yml` to add custom network settings:

```yaml
networks:
  ai_marketplace_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

## Integration with Application

### Environment Variables

Application should read from `.env`:

```env
DATABASE_URL=postgresql://ai_marketplace:dev_password_change_in_prod@localhost:5432/ai_marketplace
REDIS_URL=redis://localhost:6379
```

### Docker Compose Override

Create `docker-compose.override.yml` for local customizations:

```yaml
version: '3.8'

services:
  postgres:
    ports:
      - "5433:5432"  # Custom port
```

This file is automatically loaded and gitignored.

## Monitoring

### Resource Usage

```bash
# View resource consumption
docker stats

# View specific service
docker stats ai_marketplace_db
docker stats ai_marketplace_redis
```

### Database Statistics

```sql
-- Connect to database
make db-shell

-- Check database size
SELECT pg_size_pretty(pg_database_size('ai_marketplace'));

-- Check table sizes
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Support

For issues or questions:
1. Check logs: `make logs`
2. Verify health: `make health`
3. Review this documentation
4. Check Docker and Docker Compose versions
5. Restart services: `make restart`

## License

Part of AI Marketplace project.
