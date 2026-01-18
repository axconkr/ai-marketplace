-- Development Seed Data (Optional)
-- Uncomment to load test data for development

-- This script only runs if the database is being initialized for the first time
-- To reload seed data, drop the database and recreate it with: make reset && make init

-- ============================================
-- Development Users
-- ============================================
-- Password for all users: "password123"
-- Hashed using bcrypt with 10 rounds

/*
INSERT INTO users (id, email, username, password_hash, role, is_verified) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'admin@dev.local',
    'admin',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'admin',
    true
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'seller1@dev.local',
    'ai_creator',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'seller',
    true
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'buyer1@dev.local',
    'tech_enthusiast',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'user',
    true
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    'seller2@dev.local',
    'ml_expert',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'seller',
    true
);

-- ============================================
-- Sample AI Agents
-- ============================================

INSERT INTO ai_agents (id, owner_id, name, description, category, price_type, price, status, downloads_count, rating_average, rating_count) VALUES
(
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    'Code Review Assistant',
    'An AI agent that performs comprehensive code reviews, identifies bugs, and suggests improvements following best practices.',
    'Development',
    'subscription',
    19.99,
    'published',
    245,
    4.7,
    87
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    'Marketing Content Generator',
    'Creates engaging marketing content including social media posts, email campaigns, and ad copy.',
    'Marketing',
    'one-time',
    49.99,
    'published',
    532,
    4.9,
    156
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004',
    'Data Analysis Bot',
    'Analyzes datasets, generates insights, and creates visualization recommendations.',
    'Analytics',
    'subscription',
    29.99,
    'published',
    178,
    4.5,
    62
),
(
    '660e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440004',
    'Customer Support Agent',
    'Handles customer inquiries, provides support, and escalates complex issues appropriately.',
    'Customer Service',
    'subscription',
    39.99,
    'published',
    412,
    4.8,
    203
),
(
    '660e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440002',
    'SEO Optimizer',
    'Analyzes web content and provides SEO recommendations to improve search rankings.',
    'Marketing',
    'free',
    0.00,
    'published',
    1247,
    4.6,
    431
);

-- ============================================
-- Sample Transactions
-- ============================================

INSERT INTO transactions (id, buyer_id, seller_id, agent_id, amount, currency, status, payment_method, stripe_payment_id) VALUES
(
    '770e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440002',
    49.99,
    'USD',
    'completed',
    'credit_card',
    'pi_dev_1234567890'
),
(
    '770e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004',
    '660e8400-e29b-41d4-a716-446655440004',
    39.99,
    'USD',
    'completed',
    'credit_card',
    'pi_dev_0987654321'
);

-- ============================================
-- Sample Reviews
-- ============================================

INSERT INTO reviews (id, agent_id, user_id, rating, comment) VALUES
(
    '880e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440003',
    5,
    'Amazing tool! Saved me hours of work on marketing content. Highly recommended!'
),
(
    '880e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440003',
    4,
    'Very helpful for code reviews. Catches things I would have missed. Could use more customization options.'
),
(
    '880e8400-e29b-41d4-a716-446655440003',
    '660e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440003',
    5,
    'Best customer support agent I have used. Responses are quick and accurate.'
);

-- ============================================
-- Log seed data completion
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'Development seed data loaded successfully';
    RAISE NOTICE 'Test users created with password: password123';
    RAISE NOTICE '  - admin@dev.local (admin)';
    RAISE NOTICE '  - seller1@dev.local (seller)';
    RAISE NOTICE '  - seller2@dev.local (seller)';
    RAISE NOTICE '  - buyer1@dev.local (user)';
END $$;
*/

-- Note: To enable seed data, remove the comment markers (/* and */) above
