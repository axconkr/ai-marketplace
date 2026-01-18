# AI Marketplace Production Deployment Documentation

## Overview

Complete production deployment documentation for the AI Marketplace platform. This comprehensive guide covers configuration, security, monitoring, and operational procedures for deploying to Vercel + Supabase infrastructure.

## Documentation Structure

```
deployment/
├── Configuration
│   ├── vercel.json                          # Vercel platform config
│   └── .github/workflows/
│       └── deploy-production.yml            # CI/CD pipeline
│
├── Core Documentation
│   ├── DEPLOYMENT_QUICK_START.md           # 5-minute setup guide
│   ├── DEPLOYMENT_CHECKLIST.md             # Step-by-step verification
│   ├── PRODUCTION_SETUP.md                 # Complete environment setup
│   └── DEPLOYMENT_SUMMARY.md               # Master reference document
│
├── Operational Guides
│   ├── MONITORING_GUIDE.md                 # Monitoring & alerting
│   └── SECURITY_HARDENING.md               # Security implementation
│
└── Deployment Scripts
    ├── deploy.sh                           # Automated deployment
    ├── rollback.sh                         # Emergency rollback
    └── health-check.sh                     # Production verification
```

## Quick Start

**For first-time deployment**:
1. Read [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md) (5 minutes)
2. Follow [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) (1-2 hours)
3. Use [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) to verify

**For routine deployments**:
```bash
./scripts/deploy.sh production
```

## Documentation Files

### 1. DEPLOYMENT_QUICK_START.md
**Purpose**: Fast-track guide for experienced developers
**Contents**:
- Prerequisites checklist
- 5-minute setup commands
- Environment variables template
- Quick commands reference
- Troubleshooting basics

**Best For**: Developers who need to deploy quickly with minimal context.

---

### 2. DEPLOYMENT_CHECKLIST.md
**Purpose**: Comprehensive verification checklist
**Contents**:
- Pre-deployment checks (code quality, security, performance)
- Deployment steps (5-phase process)
- Post-deployment monitoring (0-1h, 1-24h, 1-7d)
- Rollback plan (5-step recovery)
- Emergency procedures (database, security, payment)
- Success criteria (performance targets)

**Best For**: Release managers ensuring nothing is missed during deployment.

---

### 3. PRODUCTION_SETUP.md
**Purpose**: Complete environment configuration guide
**Contents**:
- Vercel project setup with environment variables
- Supabase database configuration with connection pooling
- Stripe production mode and webhook setup
- TossPayments integration
- SendGrid email configuration
- Sentry error tracking
- Domain and SSL setup
- Security hardening
- Backup strategy
- Launch day procedures

**Best For**: DevOps engineers setting up production infrastructure for the first time.

---

### 4. MONITORING_GUIDE.md
**Purpose**: Production monitoring and alerting strategy
**Contents**:
- Sentry error tracking (alert rules, severity levels)
- Performance monitoring (Vercel Analytics, Core Web Vitals)
- Uptime monitoring (UptimeRobot, health endpoints)
- Business metrics (KPIs, user analytics)
- Log management (Winston, structured logging)
- Alert management (P0-P3 severity classification)
- Incident response (6-step workflow)
- Monitoring checklist (daily/weekly/monthly)
- Tools overview and cost estimates (~$60/month)

**Best For**: Operations team responsible for system health and incident response.

---

### 5. SECURITY_HARDENING.md
**Purpose**: Comprehensive security implementation
**Contents**:
- Environment security (secret management, rotation schedule)
- Application security (authentication, input validation, rate limiting)
- Network security (headers, CORS, CSP)
- Database security (Row Level Security, encryption)
- File upload security (validation, virus scanning)
- Payment security (Stripe, PCI DSS compliance)
- Logging and monitoring (audit logs, suspicious activity detection)
- Incident response plan (6-step security breach procedure)
- Compliance checklist (GDPR, OWASP Top 10)
- Security checklists (pre/post-launch)

**Best For**: Security team ensuring production meets security standards.

---

### 6. DEPLOYMENT_SUMMARY.md
**Purpose**: Master reference document
**Contents**:
- Complete file inventory
- Deployment workflow (initial + regular)
- Environment variables reference
- Performance targets (response times, reliability, scalability)
- Monitoring dashboards (Vercel, Supabase, Sentry, Stripe)
- Alert channels (P0-P3 routing)
- Support contacts (internal team + external vendors)
- Incident response (severity levels, procedures)
- Rollback procedures
- Cost estimates
- Security compliance
- Launch checklist
- Success metrics

**Best For**: Technical leads needing comprehensive overview of deployment infrastructure.

---

## Deployment Scripts

### deploy.sh
**Automated production deployment script**

**Features**:
- Pre-deployment checks (tests, linting, type checking)
- Security audit with npm audit
- Build verification
- Production confirmation prompt
- Environment-specific deployment (staging/production)
- Database migration execution
- Post-deployment health checks
- Slack notification integration
- Automatic rollback on failure

**Usage**:
```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production (with confirmation)
./scripts/deploy.sh production
```

**Exit Codes**:
- 0: Success
- 1: Failure (tests, build, deployment, migrations, health check)

---

### rollback.sh
**Emergency rollback script**

**Features**:
- Lists recent deployments
- Interactive deployment selection
- Confirmation prompt
- Automated rollback via Vercel CLI
- Post-rollback health checks
- Slack notification

**Usage**:
```bash
./scripts/rollback.sh
```

**When to Use**:
- Critical bug in production
- Performance degradation
- Payment system failure
- Security vulnerability

---

### health-check.sh
**Production health verification**

**Checks**:
- Health endpoint status (200 OK)
- Homepage availability
- API endpoints (prompts, categories)
- Response time measurement (<500ms target)
- SSL certificate expiry

**Usage**:
```bash
# Check production
./scripts/health-check.sh https://aimarketplace.com

# Check any deployment
./scripts/health-check.sh https://custom-deployment.vercel.app
```

---

## Configuration Files

### vercel.json
**Vercel platform configuration**

**Key Settings**:
- Build command: `npx prisma generate && npm run build`
- Framework: Next.js
- Region: Seoul (icn1)
- API timeout: 30 seconds
- Environment variable references (secure secret management)
- CORS headers for API routes
- Cron job: Monthly settlement (1st of every month at 00:00)

**Security Features**:
- Environment variables stored as Vercel secrets
- CORS restricted to production domain
- Security headers enforced

---

### .github/workflows/deploy-production.yml
**GitHub Actions CI/CD pipeline**

**Workflow Jobs**:

1. **Test Job**
   - Runs unit tests with PostgreSQL service
   - Generates Prisma Client
   - Executes migrations
   - Uploads code coverage to Codecov

2. **Security Job**
   - Snyk security scan (severity threshold: high)
   - npm audit (audit level: high)

3. **Deploy Job** (runs after test + security pass)
   - Deploys to Vercel production
   - Runs database migrations
   - Sends Slack notification on success

**Triggers**:
- Push to main branch (automatic)
- Manual workflow dispatch

---

## Deployment Workflow

### Initial Production Setup

```bash
# 1. Prerequisites
- Vercel Pro account
- Supabase Pro account
- Stripe production account
- TossPayments production credentials
- SendGrid account
- Domain configured

# 2. Setup Vercel Project
vercel login
vercel link

# 3. Configure Environment Variables
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
# ... (see PRODUCTION_SETUP.md for complete list)

# 4. Setup Supabase
# Create project → Enable pooling → Run migrations

# 5. Configure Payment Providers
# Stripe: Production mode + webhooks
# TossPayments: Production credentials + webhooks

# 6. Setup Monitoring
# Sentry, UptimeRobot, Vercel Analytics

# 7. Deploy
./scripts/deploy.sh production
```

### Regular Deployment

```bash
# 1. Automated deployment (recommended)
./scripts/deploy.sh production

# 2. Manual deployment (if needed)
npm run test:ci
npm run lint
npm run typecheck
npx prisma generate
npm run build
vercel --prod
DATABASE_URL=$PRODUCTION_DATABASE_URL npx prisma migrate deploy

# 3. Verify deployment
./scripts/health-check.sh https://aimarketplace.com

# 4. Monitor for 24 hours
# - Check Sentry for errors
# - Monitor API response times
# - Verify payment processing
# - Watch user activity
```

### Emergency Rollback

```bash
# 1. Immediate rollback
./scripts/rollback.sh

# 2. Or via Vercel CLI
vercel rollback

# 3. Or via Vercel Dashboard
# Project → Deployments → Previous deployment → Promote

# 4. Verify rollback
./scripts/health-check.sh https://aimarketplace.com

# 5. Investigate and fix
# - Review Sentry errors
# - Check deployment logs
# - Identify root cause
# - Prepare hotfix

# 6. Redeploy when ready
./scripts/deploy.sh production
```

---

## Key Performance Targets

### Response Times
- API endpoints: <500ms (P95)
- Page load time: <3s (P95)
- Time to First Byte: <500ms
- Largest Contentful Paint: <2.5s
- First Input Delay: <100ms
- Cumulative Layout Shift: <0.1

### Reliability
- Uptime: ≥99.9% (8.7 hours/year downtime)
- Error rate: <0.1%
- Payment success rate: >99%
- Database availability: >99.95%

### Scalability
- Concurrent users: 1,000+ supported
- Database connections: 100 (pooled)
- API rate limit: 100 req/min per authenticated user
- File uploads: 10MB max, concurrent processing

---

## Monitoring Dashboards

| Dashboard | URL | Purpose | Access |
|-----------|-----|---------|--------|
| Vercel | https://vercel.com/dashboard | Deployments, Analytics | Team admin |
| Supabase | https://app.supabase.com | Database, Storage | Project owner |
| Sentry | https://sentry.io | Error tracking | Dev team |
| Stripe | https://dashboard.stripe.com | Payments | Finance team |
| UptimeRobot | https://uptimerobot.com | Uptime monitoring | DevOps team |

---

## Alert Severity Levels

### P0 - Critical (Immediate Response)
- Production system down
- Data loss detected
- Security breach
- Payment system failure
- **Response Time**: 5 minutes
- **Channels**: PagerDuty, Slack, Email, SMS

### P1 - High (15 Minute Response)
- API error rate >1%
- Database performance degraded
- Critical feature unavailable
- Payment webhook failures
- **Response Time**: 15 minutes
- **Channels**: Slack, Email

### P2 - Medium (1 Hour Response)
- Elevated error rates
- Performance degradation
- Non-critical feature issues
- Third-party service issues
- **Response Time**: 1 hour
- **Channels**: Slack

### P3 - Low (Next Business Day)
- Minor bugs
- Documentation issues
- Performance optimization opportunities
- **Response Time**: Next business day
- **Channels**: Email

---

## Cost Breakdown

### Monthly Fixed Costs
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Sentry Team: $26/month
- UptimeRobot Pro: $7/month
- SendGrid Essentials: $20/month (40k emails)
- **Total**: ~$100/month

### Variable Costs
- Stripe: 3.4% + ₩250 per transaction
- TossPayments: 3.3% per transaction
- Supabase Storage: $0.021/GB/month
- Vercel Bandwidth: Included up to 100GB

---

## Support Contacts

### Internal Team
- **DevOps Lead**: devops@aimarketplace.com
- **Database Admin**: dba@aimarketplace.com
- **Security Team**: security@aimarketplace.com
- **On-Call Engineer**: oncall@aimarketplace.com / +82-10-XXXX-XXXX

### External Vendors
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Stripe Support**: https://support.stripe.com
- **TossPayments**: https://developers.tosspayments.com/support

---

## Documentation Statistics

- **Total Files**: 11 (configuration + documentation + scripts)
- **Total Lines**: 2,827 lines
- **Documentation Pages**: 6 comprehensive guides
- **Scripts**: 3 automation scripts
- **Configuration Files**: 2 (Vercel + GitHub Actions)

## Next Steps

1. **First-Time Setup**: Start with [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)
2. **Complete Setup**: Follow [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)
3. **Security Review**: Implement [SECURITY_HARDENING.md](./SECURITY_HARDENING.md)
4. **Configure Monitoring**: Setup [MONITORING_GUIDE.md](./MONITORING_GUIDE.md)
5. **Deploy**: Run `./scripts/deploy.sh production`
6. **Verify**: Use [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
7. **Monitor**: Track metrics for 24-48 hours
8. **Optimize**: Iterate based on feedback and metrics

---

## Additional Resources

- **Architecture Documentation**: [../ARCHITECTURE.md](../ARCHITECTURE.md)
- **API Documentation**: [../API.md](../API.md)
- **Contributing Guide**: [../CONTRIBUTING.md](../CONTRIBUTING.md)
- **Testing Guide**: [../TESTING.md](../TESTING.md)

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-28
**Maintained By**: DevOps Team
**Contact**: devops@aimarketplace.com
