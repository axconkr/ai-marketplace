# Quick Start Guide - AI Marketplace Development

Get up and running in 5 minutes.

## Prerequisites

- Docker Desktop installed and running
- Make utility (pre-installed on macOS/Linux)
- Terminal access

## 1. Initialize Environment (First Time Only)

```bash
# Clone repository and navigate to project
cd AI_marketplace

# Initialize Docker environment
make init
```

This will:
- Create `.env` file from template
- Start PostgreSQL and Redis containers
- Initialize database with schema
- Start Adminer for database management

## 2. Verify Everything Works

```bash
# Check service health
make health

# View service status
make status
```

Expected output:
```
✅ PostgreSQL: Healthy
✅ Redis: Healthy
```

## 3. Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **PostgreSQL** | localhost:5432 | user: `ai_marketplace`<br>pass: `dev_password_change_in_prod`<br>db: `ai_marketplace` |
| **Redis** | localhost:6379 | (no auth) |
| **Adminer** | http://localhost:8080 | System: PostgreSQL<br>Server: `postgres`<br>User: `ai_marketplace`<br>Pass: `dev_password_change_in_prod` |

## 4. Common Commands

```bash
# Daily workflow
make up-core          # Start DB and Redis
make logs            # View logs
make down            # Stop services

# Database operations
make db-shell        # Access PostgreSQL
make db-backup       # Backup database
make adminer         # Open Adminer in browser

# Troubleshooting
make health          # Check service health
make restart         # Restart all services
make reset           # Nuclear option - reset everything
```

## 5. Connect Your Application

### Environment Variables

Copy to your application's `.env`:

```env
DATABASE_URL=postgresql://ai_marketplace:dev_password_change_in_prod@localhost:5432/ai_marketplace
REDIS_URL=redis://localhost:6379
```

### Node.js Example

```javascript
// PostgreSQL with Prisma
// npx prisma init
// Update DATABASE_URL in .env
// npx prisma migrate dev

// Redis
const redis = require('redis');
const client = redis.createClient({
  url: 'redis://localhost:6379'
});
await client.connect();
```

### Python Example

```python
# PostgreSQL
import psycopg2
conn = psycopg2.connect(
    "postgresql://ai_marketplace:dev_password_change_in_prod@localhost:5432/ai_marketplace"
)

# Redis
import redis
r = redis.Redis(host='localhost', port=6379, decode_responses=True)
```

## 6. Database Schema

Pre-configured tables:
- **users** - User authentication and profiles
- **ai_agents** - AI agent marketplace listings
- **transactions** - Payment processing
- **reviews** - Agent ratings and reviews

View schema:
```bash
make db-shell
\dt  # List tables
\d users  # Describe users table
```

## 7. Development Workflow

```bash
# Morning: Start services
make up-core

# During development: Monitor logs
make logs

# Check database: Use Adminer
make adminer

# Before commits: Backup data
make db-backup

# Evening: Stop services
make down
```

## 8. Troubleshooting

### Services won't start
```bash
# Check Docker is running
docker ps

# Restart Docker Desktop
# Then retry
make restart
```

### Port conflicts
```bash
# Check what's using ports
lsof -i :5432
lsof -i :6379

# Change ports in .env
DB_PORT=5433
REDIS_PORT=6380
```

### Data lost
```bash
# Volumes might be deleted
# Reinitialize
make reset
make init
```

### Can't connect to database
```bash
# Check health
make health

# View logs
make logs-db

# Restart
make restart
```

## 9. Additional Utilities

Database utilities script:
```bash
# Make executable (if needed)
chmod +x scripts/db-utils.sh

# View help
./scripts/db-utils.sh help

# Common operations
./scripts/db-utils.sh stats           # Database statistics
./scripts/db-utils.sh counts          # Row counts
./scripts/db-utils.sh export-schema   # Export schema
./scripts/db-utils.sh create-migration <name>  # Create migration
```

## 10. Next Steps

1. Review full documentation: `DOCKER_SETUP.md`
2. Customize `.env` for your needs
3. Add seed data: Edit `docker/init-scripts/02-seed-dev-data.sql`
4. Set up your application framework
5. Configure ORM (Prisma, TypeORM, etc.)

## Commands Cheat Sheet

```bash
make help          # Show all commands
make up            # Start with Adminer
make up-core       # Start DB + Redis only
make down          # Stop all
make restart       # Restart
make status        # Service status
make health        # Health check
make logs          # All logs
make logs-db       # DB logs only
make logs-redis    # Redis logs only
make db-shell      # PostgreSQL CLI
make redis-shell   # Redis CLI
make db-backup     # Backup database
make adminer       # Open Adminer
make clean         # Remove containers
make reset         # Delete everything (DANGEROUS)
```

## Support

- Full documentation: `DOCKER_SETUP.md`
- Database utilities: `scripts/db-utils.sh help`
- All commands: `make help`

---

**Ready to code!** 🚀

Your development environment is configured and running. Start building your AI Marketplace application.
