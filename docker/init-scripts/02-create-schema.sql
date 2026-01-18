-- AI Marketplace Database Schema
-- Generated from prisma/schema.prisma
-- User: ai_marketplace
-- Database: ai_marketplace

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- USER AND SESSION MODELS
-- ============================================================================

CREATE TABLE "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    name TEXT,
    avatar TEXT,
    role TEXT DEFAULT 'user' NOT NULL,
    "emailVerified" BOOLEAN DEFAULT false NOT NULL,

    -- OAuth fields
    "oauthProvider" TEXT,
    "oauthId" TEXT,

    -- Settlement fields
    stripe_account_id TEXT,
    bank_name TEXT,
    bank_account TEXT,
    account_holder TEXT,
    bank_verified BOOLEAN DEFAULT false NOT NULL,
    platform_fee_rate DOUBLE PRECISION DEFAULT 0.15 NOT NULL,

    -- Verifier stats (JSONB)
    verifier_stats JSONB,

    -- Notification settings (JSONB)
    notification_settings JSONB,

    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "User_email_idx" ON "User"(email);
CREATE INDEX "User_oauthProvider_oauthId_idx" ON "User"("oauthProvider", "oauthId");
CREATE INDEX "User_role_idx" ON "User"(role);

CREATE TABLE "Session" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT UNIQUE NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,

    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_refreshToken_idx" ON "Session"("refreshToken");

-- ============================================================================
-- PRODUCT AND FILE MODELS
-- ============================================================================

CREATE TYPE "FileStatus" AS ENUM ('ACTIVE', 'DELETED', 'SCANNING', 'QUARANTINED');

CREATE TABLE "Product" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    price DOUBLE PRECISION NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    seller_id TEXT NOT NULL,
    status TEXT DEFAULT 'draft' NOT NULL,
    category TEXT,
    download_count INTEGER DEFAULT 0 NOT NULL,

    -- Verification fields
    verification_level INTEGER DEFAULT 0 NOT NULL,
    verification_badges TEXT[] DEFAULT ARRAY[]::TEXT[],
    verification_score DOUBLE PRECISION,

    -- Review fields
    rating_average DOUBLE PRECISION,
    rating_count INTEGER DEFAULT 0 NOT NULL,
    rating_distribution JSONB,

    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    FOREIGN KEY (seller_id) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "Product_seller_id_idx" ON "Product"(seller_id);
CREATE INDEX "Product_status_idx" ON "Product"(status);
CREATE INDEX "Product_category_idx" ON "Product"(category);
CREATE INDEX "Product_verification_level_idx" ON "Product"(verification_level);
CREATE INDEX "Product_rating_average_idx" ON "Product"(rating_average);

CREATE TABLE "File" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    product_id TEXT,
    user_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    url TEXT NOT NULL,
    download_count INTEGER DEFAULT 0 NOT NULL,
    status "FileStatus" DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP(3) NOT NULL,
    deleted_at TIMESTAMP(3),

    FOREIGN KEY (product_id) REFERENCES "Product"(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "File_product_id_idx" ON "File"(product_id);
CREATE INDEX "File_user_id_idx" ON "File"(user_id);
CREATE INDEX "File_status_idx" ON "File"(status);

-- ============================================================================
-- PAYMENT MODELS
-- ============================================================================

CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'COMPLETED', 'REFUNDED', 'CANCELLED', 'FAILED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

CREATE TABLE "Order" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    buyer_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    currency TEXT NOT NULL,
    platform_fee DOUBLE PRECISION NOT NULL,
    seller_amount DOUBLE PRECISION NOT NULL,
    status "OrderStatus" DEFAULT 'PENDING' NOT NULL,
    payment_provider TEXT,
    refund_requested BOOLEAN DEFAULT false NOT NULL,
    refund_reason TEXT,
    access_granted BOOLEAN DEFAULT false NOT NULL,
    download_url TEXT,
    download_expires TIMESTAMP(3),

    paid_at TIMESTAMP(3),
    refunded_at TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    FOREIGN KEY (buyer_id) REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES "Product"(id) ON DELETE CASCADE
);

CREATE INDEX "Order_buyer_id_idx" ON "Order"(buyer_id);
CREATE INDEX "Order_product_id_idx" ON "Order"(product_id);
CREATE INDEX "Order_status_idx" ON "Order"(status);
CREATE INDEX "Order_paid_at_idx" ON "Order"(paid_at);

CREATE TABLE "Payment" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL,
    provider_payment_id TEXT UNIQUE NOT NULL,
    provider_customer_id TEXT,
    amount DOUBLE PRECISION NOT NULL,
    currency TEXT NOT NULL,
    status "PaymentStatus" DEFAULT 'PENDING' NOT NULL,
    payment_method TEXT,
    card_last4 TEXT,
    card_brand TEXT,
    failure_code TEXT,
    failure_message TEXT,
    metadata JSONB,

    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    FOREIGN KEY (order_id) REFERENCES "Order"(id) ON DELETE CASCADE
);

CREATE INDEX "Payment_provider_payment_id_idx" ON "Payment"(provider_payment_id);
CREATE INDEX "Payment_status_idx" ON "Payment"(status);

CREATE TABLE "Refund" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL,
    provider_refund_id TEXT UNIQUE NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    currency TEXT NOT NULL,
    reason TEXT,
    status "RefundStatus" DEFAULT 'PENDING' NOT NULL,
    initiated_by TEXT NOT NULL,
    approved_by TEXT,
    failure_reason TEXT,

    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    FOREIGN KEY (order_id) REFERENCES "Order"(id) ON DELETE CASCADE
);

CREATE INDEX "Refund_provider_refund_id_idx" ON "Refund"(provider_refund_id);
CREATE INDEX "Refund_status_idx" ON "Refund"(status);

-- ============================================================================
-- SETTLEMENT MODELS
-- ============================================================================

CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED');
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'INCLUDED_IN_SETTLEMENT', 'PAID');

CREATE TABLE "Settlement" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    seller_id TEXT NOT NULL,
    total_amount DOUBLE PRECISION DEFAULT 0 NOT NULL,
    platform_fee DOUBLE PRECISION DEFAULT 0 NOT NULL,
    payout_amount DOUBLE PRECISION NOT NULL,

    -- Verifier-specific fields
    verification_earnings INTEGER DEFAULT 0 NOT NULL,
    verification_count INTEGER DEFAULT 0 NOT NULL,

    currency TEXT NOT NULL,
    status "SettlementStatus" DEFAULT 'PENDING' NOT NULL,
    period_start TIMESTAMP(3) NOT NULL,
    period_end TIMESTAMP(3) NOT NULL,
    payout_date TIMESTAMP(3),
    payout_method TEXT,
    payout_reference TEXT,

    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    FOREIGN KEY (seller_id) REFERENCES "User"(id) ON DELETE CASCADE,
    UNIQUE (seller_id, period_start)
);

CREATE INDEX "Settlement_seller_id_idx" ON "Settlement"(seller_id);
CREATE INDEX "Settlement_status_idx" ON "Settlement"(status);
CREATE INDEX "Settlement_period_start_period_end_idx" ON "Settlement"(period_start, period_end);

CREATE TABLE "SettlementItem" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    settlement_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    order_id TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    platform_fee DOUBLE PRECISION NOT NULL,
    payout_amount DOUBLE PRECISION NOT NULL,

    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,

    FOREIGN KEY (settlement_id) REFERENCES "Settlement"(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES "Product"(id) ON DELETE CASCADE
);

CREATE INDEX "SettlementItem_settlement_id_idx" ON "SettlementItem"(settlement_id);
CREATE INDEX "SettlementItem_product_id_idx" ON "SettlementItem"(product_id);

-- ============================================================================
-- VERIFICATION MODELS
-- ============================================================================

CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REJECTED', 'CANCELLED');

CREATE TABLE "Verification" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    product_id TEXT NOT NULL,
    verifier_id TEXT,

    -- Verification details
    level INTEGER NOT NULL,
    status "VerificationStatus" DEFAULT 'PENDING' NOT NULL,

    -- Pricing
    fee INTEGER NOT NULL,
    platform_share INTEGER NOT NULL,
    verifier_share INTEGER NOT NULL,

    -- Report
    report JSONB,
    score DOUBLE PRECISION,

    -- Badges
    badges TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Workflow
    requested_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    assigned_at TIMESTAMP(3),
    reviewed_at TIMESTAMP(3),
    completed_at TIMESTAMP(3),

    FOREIGN KEY (product_id) REFERENCES "Product"(id) ON DELETE CASCADE,
    FOREIGN KEY (verifier_id) REFERENCES "User"(id) ON DELETE SET NULL
);

CREATE INDEX "Verification_product_id_idx" ON "Verification"(product_id);
CREATE INDEX "Verification_verifier_id_idx" ON "Verification"(verifier_id);
CREATE INDEX "Verification_status_idx" ON "Verification"(status);
CREATE INDEX "Verification_level_idx" ON "Verification"(level);
CREATE INDEX "Verification_completed_at_idx" ON "Verification"(completed_at);

CREATE TABLE "VerifierPayout" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    verifier_id TEXT NOT NULL,
    verification_id TEXT UNIQUE NOT NULL,
    settlement_id TEXT,

    amount INTEGER NOT NULL,
    status "PayoutStatus" DEFAULT 'PENDING' NOT NULL,

    paid_at TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    FOREIGN KEY (verifier_id) REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY (verification_id) REFERENCES "Verification"(id) ON DELETE CASCADE,
    FOREIGN KEY (settlement_id) REFERENCES "Settlement"(id) ON DELETE SET NULL
);

CREATE INDEX "VerifierPayout_verifier_id_idx" ON "VerifierPayout"(verifier_id);
CREATE INDEX "VerifierPayout_verification_id_idx" ON "VerifierPayout"(verification_id);
CREATE INDEX "VerifierPayout_settlement_id_idx" ON "VerifierPayout"(settlement_id);
CREATE INDEX "VerifierPayout_status_idx" ON "VerifierPayout"(status);
CREATE INDEX "VerifierPayout_createdAt_idx" ON "VerifierPayout"("createdAt");

-- ============================================================================
-- NOTIFICATION MODELS
-- ============================================================================

CREATE TYPE "NotificationType" AS ENUM (
    'ORDER_PLACED', 'ORDER_COMPLETED', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED',
    'REFUND_APPROVED', 'REFUND_REJECTED', 'PRODUCT_APPROVED', 'PRODUCT_REJECTED',
    'VERIFICATION_REQUESTED', 'VERIFICATION_COMPLETED', 'VERIFICATION_ASSIGNED',
    'SETTLEMENT_READY', 'SETTLEMENT_PAID', 'REVIEW_RECEIVED',
    'MESSAGE_RECEIVED', 'SYSTEM_ANNOUNCEMENT'
);

CREATE TABLE "Notification" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,

    -- Content
    type "NotificationType" NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,

    -- Metadata
    data JSONB,

    -- Status
    read BOOLEAN DEFAULT false NOT NULL,
    read_at TIMESTAMP(3),

    -- Timestamps
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMP(3),

    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "Notification_user_id_read_idx" ON "Notification"(user_id, read);
CREATE INDEX "Notification_user_id_created_at_idx" ON "Notification"(user_id, created_at);
CREATE INDEX "Notification_created_at_idx" ON "Notification"(created_at);

-- ============================================================================
-- REVIEW MODELS
-- ============================================================================

CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED', 'DELETED');

CREATE TABLE "Review" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT UNIQUE NOT NULL,
    product_id TEXT NOT NULL,
    user_id TEXT NOT NULL,

    -- Review content
    rating INTEGER NOT NULL,
    title TEXT,
    comment TEXT NOT NULL,

    -- Media
    images TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Verification
    verified_purchase BOOLEAN DEFAULT true NOT NULL,

    -- Seller response
    seller_reply TEXT,
    seller_replied_at TIMESTAMP(3),

    -- Moderation
    status "ReviewStatus" DEFAULT 'PUBLISHED' NOT NULL,
    flagged BOOLEAN DEFAULT false NOT NULL,
    flag_reason TEXT,

    -- Helpful votes
    helpful_count INTEGER DEFAULT 0 NOT NULL,
    not_helpful_count INTEGER DEFAULT 0 NOT NULL,

    -- Timestamps
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP(3) NOT NULL,

    FOREIGN KEY (order_id) REFERENCES "Order"(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES "Product"(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "Review_product_id_idx" ON "Review"(product_id);
CREATE INDEX "Review_user_id_idx" ON "Review"(user_id);
CREATE INDEX "Review_rating_idx" ON "Review"(rating);
CREATE INDEX "Review_created_at_idx" ON "Review"(created_at);
CREATE INDEX "Review_status_idx" ON "Review"(status);

CREATE TABLE "ReviewVote" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    review_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,

    FOREIGN KEY (review_id) REFERENCES "Review"(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
    UNIQUE (review_id, user_id)
);

CREATE INDEX "ReviewVote_review_id_idx" ON "ReviewVote"(review_id);

-- Grant all permissions to ai_marketplace user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ai_marketplace;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ai_marketplace;
