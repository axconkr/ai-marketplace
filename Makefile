.PHONY: help up down start stop restart logs logs-db logs-redis clean reset db-shell redis-shell adminer health status

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(CYAN)AI Marketplace - Docker Development Environment$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-20s$(NC) %s\n", $$1, $$2}'

up: ## Start all services (with Adminer)
	@echo "$(GREEN)Starting all services with Adminer...$(NC)"
	@docker-compose --profile tools up -d
	@make health

up-core: ## Start core services only (DB + Redis)
	@echo "$(GREEN)Starting core services...$(NC)"
	@docker-compose up -d postgres redis
	@make health

down: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	@docker-compose --profile tools down

start: up-core ## Alias for up-core

stop: down ## Alias for down

restart: ## Restart all services
	@echo "$(YELLOW)Restarting services...$(NC)"
	@make down
	@sleep 2
	@make up

logs: ## Show logs from all services
	@docker-compose logs -f

logs-db: ## Show PostgreSQL logs
	@docker-compose logs -f postgres

logs-redis: ## Show Redis logs
	@docker-compose logs -f redis

clean: ## Remove containers but keep volumes
	@echo "$(YELLOW)Removing containers...$(NC)"
	@docker-compose --profile tools down
	@echo "$(GREEN)Containers removed. Volumes preserved.$(NC)"

reset: ## Remove everything including volumes (DANGEROUS)
	@echo "$(RED)WARNING: This will delete all data!$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to cancel, Enter to continue...$(NC)"
	@read confirmation
	@docker-compose --profile tools down -v
	@docker volume rm -f ai_marketplace_postgres_data ai_marketplace_redis_data 2>/dev/null || true
	@echo "$(GREEN)All data removed. Clean slate ready.$(NC)"

db-shell: ## Access PostgreSQL shell
	@echo "$(CYAN)Connecting to PostgreSQL...$(NC)"
	@docker-compose exec postgres psql -U ai_marketplace -d ai_marketplace

redis-shell: ## Access Redis CLI
	@echo "$(CYAN)Connecting to Redis...$(NC)"
	@docker-compose exec redis redis-cli

adminer: ## Open Adminer in browser (requires Adminer to be running)
	@echo "$(CYAN)Opening Adminer...$(NC)"
	@open http://localhost:8080 || xdg-open http://localhost:8080 || echo "Please open http://localhost:8080 in your browser"

health: ## Check service health status
	@echo "$(CYAN)Checking service health...$(NC)"
	@echo ""
	@echo "$(GREEN)PostgreSQL:$(NC)"
	@docker-compose exec -T postgres pg_isready -U ai_marketplace 2>/dev/null && echo "  ✅ Healthy" || echo "  ❌ Unhealthy"
	@echo ""
	@echo "$(GREEN)Redis:$(NC)"
	@docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG && echo "  ✅ Healthy" || echo "  ❌ Unhealthy"
	@echo ""

status: ## Show running services status
	@echo "$(CYAN)Service Status:$(NC)"
	@docker-compose ps

db-backup: ## Backup PostgreSQL database
	@echo "$(CYAN)Creating database backup...$(NC)"
	@mkdir -p ./backups
	@docker-compose exec -T postgres pg_dump -U ai_marketplace ai_marketplace > ./backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)Backup created in ./backups/$(NC)"

db-restore: ## Restore PostgreSQL database (usage: make db-restore FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: Please specify FILE=path/to/backup.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Restoring database from $(FILE)...$(NC)"
	@docker-compose exec -T postgres psql -U ai_marketplace ai_marketplace < $(FILE)
	@echo "$(GREEN)Database restored$(NC)"

redis-flush: ## Flush all Redis data (DANGEROUS)
	@echo "$(RED)WARNING: This will delete all Redis cache data!$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to cancel, Enter to continue...$(NC)"
	@read confirmation
	@docker-compose exec redis redis-cli FLUSHALL
	@echo "$(GREEN)Redis cache cleared$(NC)"

init: ## Initialize development environment
	@echo "$(CYAN)Initializing development environment...$(NC)"
	@mkdir -p docker/init-scripts
	@mkdir -p backups
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Creating .env file from example...$(NC)"; \
		cp .env.example .env 2>/dev/null || echo "# Database Configuration\nDB_USER=ai_marketplace\nDB_PASSWORD=dev_password_change_in_prod\nDB_NAME=ai_marketplace\nDB_PORT=5432\n\n# Redis Configuration\nREDIS_PORT=6379\n\n# Adminer Configuration\nADMINER_PORT=8080" > .env; \
	fi
	@make up
	@echo "$(GREEN)Development environment ready!$(NC)"
	@echo ""
	@echo "$(CYAN)Access points:$(NC)"
	@echo "  PostgreSQL: localhost:5432"
	@echo "  Redis:      localhost:6379"
	@echo "  Adminer:    http://localhost:8080"
	@echo ""
	@echo "$(YELLOW)Run 'make help' for more commands$(NC)"
