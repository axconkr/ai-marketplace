# Verification System - Deployment Checklist

Use this checklist to deploy the product verification system to production.

---

## Pre-Deployment Checklist

### 1. Code Review ✅

- [x] Prisma schema updated with Verification models
- [x] Service layer implemented (8 files)
- [x] API routes implemented (9 endpoints)
- [x] TypeScript types defined
- [x] Utility functions created
- [x] Documentation complete

### 2. Database Migration 🔄

- [ ] Review migration SQL: `/docs/VERIFICATION_MIGRATION.sql`
- [ ] Backup production database
- [ ] Run migration in development:
  ```bash
  npx prisma migrate dev --name add_verification_system
  ```
- [ ] Test migration on staging database
- [ ] Apply to production:
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Generate Prisma client:
  ```bash
  npx prisma generate
  ```

### 3. Environment Variables 🔄

- [ ] Verify `.env` has required variables:
  - `DATABASE_URL` - PostgreSQL connection
  - `STRIPE_SECRET_KEY` - Payment processing
  - `STRIPE_WEBHOOK_SECRET` - Webhook verification
  - `UPLOAD_DIR` - File storage path
  - `MAX_FILE_SIZE` - File size limit (500MB default)

### 4. Dependencies 🔄

- [ ] Install/verify dependencies:
  ```bash
  npm install
  ```
- [ ] Check Prisma client version matches schema
- [ ] Verify payment provider packages installed

---

## Testing Checklist

### 5. Unit Tests 🔄

- [ ] Test Level 0 verification (pass case)
  ```bash
  npm test -- level0.test.ts
  ```
- [ ] Test Level 0 verification (fail case)
- [ ] Test Level 1 verification request
- [ ] Test verifier assignment
- [ ] Test review submission
- [ ] Test payout calculation

### 6. Integration Tests 🔄

- [ ] Test full seller workflow:
  - Request Level 0 verification
  - Product status updates correctly
  - Verification report generated
- [ ] Test full Level 1 workflow:
  - Request with payment
  - Verifier assignment
  - Review submission
  - Product updated
  - Payout created
- [ ] Test API endpoints:
  - POST /api/verifications (Level 0)
  - POST /api/verifications (Level 1)
  - GET /api/verifications
  - GET /api/verifications/[id]
  - PATCH /api/verifications/[id]/assign
  - PATCH /api/verifications/[id]/start
  - POST /api/verifications/[id]/submit
  - POST /api/verifications/[id]/cancel
  - GET /api/verifications/available
  - POST /api/verifications/[id]/claim

### 7. Payment Tests 🔄

- [ ] Test payment intent creation (Level 1)
- [ ] Test payment confirmation
- [ ] Test verifier payout record creation
- [ ] Test settlement integration
- [ ] Test refund (cancelled verification)

### 8. Edge Cases 🔄

- [ ] Test with missing product
- [ ] Test with unauthorized user
- [ ] Test duplicate verification request
- [ ] Test cancellation of completed verification (should fail)
- [ ] Test claim of already-assigned verification (should fail)
- [ ] Test review submission with invalid score (should fail)
- [ ] Test file size exceeding limit
- [ ] Test invalid file format

---

## Data Setup

### 9. Create Verifier Accounts 🔄

- [ ] Create at least 2 test verifier accounts:
  ```sql
  INSERT INTO "User" (id, email, name, role, emailVerified, verifier_stats)
  VALUES
    ('verifier001', 'verifier1@example.com', 'Expert Verifier 1', 'verifier', true,
     '{"total_verifications": 0, "total_earnings": 0, "approval_rate": 0, "avg_score": 0}'),
    ('verifier002', 'verifier2@example.com', 'Expert Verifier 2', 'verifier', true,
     '{"total_verifications": 0, "total_earnings": 0, "approval_rate": 0, "avg_score": 0}');
  ```

### 10. Test Products 🔄

- [ ] Create test product for Level 0 verification
- [ ] Create test product for Level 1 verification
- [ ] Upload test files (valid formats)
- [ ] Upload test files (invalid formats for testing)

---

## Deployment

### 11. Build and Deploy 🔄

- [ ] Build production bundle:
  ```bash
  npm run build
  ```
- [ ] Fix any build errors
- [ ] Deploy to staging:
  ```bash
  vercel deploy
  ```
- [ ] Test on staging environment
- [ ] Deploy to production:
  ```bash
  vercel deploy --prod
  ```

### 12. Post-Deployment Verification 🔄

- [ ] Verify database migration applied
- [ ] Verify API endpoints accessible
- [ ] Test Level 0 verification on production
- [ ] Test Level 1 payment flow on production
- [ ] Check logs for errors
- [ ] Monitor performance

---

## Monitoring Setup

### 13. Logging and Monitoring 🔄

- [ ] Configure logging for verification events:
  - Verification requests
  - Payment processing
  - Review submissions
  - Errors and failures
- [ ] Set up alerts for:
  - Failed verifications (high rate)
  - Payment failures
  - Payout processing errors
- [ ] Create dashboard for:
  - Verification volume by level
  - Revenue from verifications
  - Verifier earnings
  - Average review time

### 14. Analytics Tracking 🔄

- [ ] Track events:
  - `verification_requested`
  - `verification_completed`
  - `verification_approved`
  - `verification_rejected`
  - `verification_payment_success`
  - `verification_payment_failed`
  - `verifier_review_submitted`
  - `verifier_payout_created`

---

## Documentation

### 15. User Documentation 🔄

- [ ] Create seller guide:
  - How to request verification
  - What each level includes
  - Pricing and payment
  - How to interpret results
- [ ] Create verifier guide:
  - How to become a verifier
  - How to claim verifications
  - Review guidelines
  - How to submit reviews
  - Payment and earnings
- [ ] Add to help center/FAQ

### 16. Admin Documentation 🔄

- [ ] Create admin guide:
  - How to assign verifications manually
  - How to monitor verification status
  - How to handle disputes
  - How to process verifier payouts
- [ ] Document common issues and solutions

---

## Communication

### 17. Stakeholder Communication 🔄

- [ ] Notify sellers of new verification system
- [ ] Recruit and onboard initial verifiers
- [ ] Announce feature launch
- [ ] Provide training materials

### 18. Support Readiness 🔄

- [ ] Train support team on verification system
- [ ] Create support ticket templates
- [ ] Prepare FAQ responses
- [ ] Set up escalation process

---

## Go-Live Plan

### 19. Phased Rollout 🔄

**Phase 1: Soft Launch (Week 1)**
- [ ] Enable for 10% of sellers (beta group)
- [ ] Monitor closely for issues
- [ ] Collect feedback
- [ ] Fix any critical bugs

**Phase 2: Limited Launch (Week 2)**
- [ ] Enable for 50% of sellers
- [ ] Continue monitoring
- [ ] Optimize based on feedback

**Phase 3: Full Launch (Week 3)**
- [ ] Enable for 100% of sellers
- [ ] Official announcement
- [ ] Marketing campaign

### 20. Success Metrics 🔄

- [ ] Define success criteria:
  - [ ] Verification adoption rate >20% within 30 days
  - [ ] Level 1 conversion rate >10%
  - [ ] Average review time <48 hours
  - [ ] Verifier satisfaction score >4/5
  - [ ] Seller satisfaction score >4/5
  - [ ] Platform revenue from verifications >$5K/month

---

## Post-Launch

### 21. Continuous Improvement 🔄

- [ ] Collect user feedback weekly
- [ ] Review metrics monthly
- [ ] Identify improvement opportunities
- [ ] Plan Phase 2 features (Level 2-3)

### 22. Maintenance 🔄

- [ ] Schedule monthly review of:
  - Verification quality
  - Verifier performance
  - Payment processing
  - System performance
- [ ] Update documentation as needed
- [ ] Refine verification criteria based on data

---

## Emergency Contacts

**Development Team**: dev-team@example.com
**Database Admin**: dba@example.com
**Payment Support**: payments@example.com
**Customer Support**: support@example.com

---

## Rollback Plan

If critical issues arise:

1. **Disable verification requests**:
   ```sql
   -- Temporarily disable new verifications
   -- Add feature flag to API routes
   ```

2. **Cancel pending verifications**:
   ```sql
   UPDATE "Verification"
   SET status = 'CANCELLED'
   WHERE status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS');
   ```

3. **Process refunds** for cancelled Level 1 verifications

4. **Notify affected users**

5. **Rollback database** if necessary:
   ```bash
   npx prisma migrate resolve --rolled-back <migration-name>
   ```

6. **Fix issues** and re-deploy

---

## Completion Sign-Off

**Deployment Date**: _____________

**Deployed By**: _____________

**Verified By**: _____________

**Production URL**: _____________

**Status**:
- [ ] All checks passed
- [ ] System operational
- [ ] Users notified
- [ ] Monitoring active

---

## Quick Reference

**Documentation**:
- Full Guide: `/docs/VERIFICATION_SYSTEM.md`
- Summary: `/VERIFICATION_IMPLEMENTATION_SUMMARY.md`
- Migration: `/docs/VERIFICATION_MIGRATION.sql`
- Quick Start: `/lib/services/verification/README.md`

**API Endpoints**:
- Request: `POST /api/verifications`
- List: `GET /api/verifications`
- Details: `GET /api/verifications/[id]`
- Assign: `PATCH /api/verifications/[id]/assign`
- Start: `PATCH /api/verifications/[id]/start`
- Submit: `POST /api/verifications/[id]/submit`
- Cancel: `POST /api/verifications/[id]/cancel`
- Available: `GET /api/verifications/available`
- Claim: `POST /api/verifications/[id]/claim`

**Support Queries**:
```sql
-- Verification stats
SELECT level, status, COUNT(*) FROM "Verification" GROUP BY level, status;

-- Verifier earnings
SELECT verifier_id, SUM(amount), COUNT(*) FROM "VerifierPayout" GROUP BY verifier_id;

-- Recent verifications
SELECT * FROM "Verification" ORDER BY requested_at DESC LIMIT 10;
```

---

**Ready to deploy!** 🚀
