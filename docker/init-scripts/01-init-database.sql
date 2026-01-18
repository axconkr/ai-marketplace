-- AI Marketplace Database Initialization Script
-- This script runs automatically when the PostgreSQL container is first created

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Fix PostgreSQL 15 public schema permissions
-- In PostgreSQL 15, the default privileges for the public schema have been changed
-- We need to explicitly grant CREATE privilege to the database owner
ALTER SCHEMA public OWNER TO ai_marketplace;
GRANT ALL ON SCHEMA public TO ai_marketplace;
GRANT CREATE ON SCHEMA public TO ai_marketplace;

-- Grant full access to public schema (required for Prisma)
GRANT ALL PRIVILEGES ON SCHEMA public TO ai_marketplace;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ai_marketplace;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ai_marketplace;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO ai_marketplace;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ai_marketplace;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ai_marketplace;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO ai_marketplace;

-- Create development schema
CREATE SCHEMA IF NOT EXISTS dev;

-- Grant privileges to dev schema
GRANT ALL PRIVILEGES ON SCHEMA dev TO ai_marketplace;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA dev TO ai_marketplace;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA dev TO ai_marketplace;

-- Create initial tables (example structure based on PRD)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Agents table
CREATE TABLE IF NOT EXISTS ai_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price_type VARCHAR(50) NOT NULL, -- 'free', 'one-time', 'subscription'
    price DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'suspended'
    downloads_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3, 2) DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
    payment_method VARCHAR(50),
    stripe_payment_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_ai_agents_owner ON ai_agents(owner_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_category ON ai_agents(category);
CREATE INDEX IF NOT EXISTS idx_ai_agents_status ON ai_agents(status);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_reviews_agent ON reviews(agent_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert development seed data (optional)
-- Uncomment to add test data

-- INSERT INTO users (email, username, password_hash, role, is_verified) VALUES
-- ('admin@example.com', 'admin', crypt('admin123', gen_salt('bf')), 'admin', true),
-- ('seller@example.com', 'seller', crypt('seller123', gen_salt('bf')), 'seller', true),
-- ('buyer@example.com', 'buyer', crypt('buyer123', gen_salt('bf')), 'user', true);

-- Log initialization completion
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully';
END $$;
