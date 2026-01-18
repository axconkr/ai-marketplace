# Production Deployment Quick Start Guide

## Prerequisites

- [ ] Vercel account with Pro plan
- [ ] Supabase account with Pro plan
- [ ] Stripe production account
- [ ] TossPayments production credentials
- [ ] SendGrid account
- [ ] Domain name configured
- [ ] GitHub repository access

## 5-Minute Setup

### 1. Clone and Install

```bash
git clone https://github.com/your-org/ai-marketplace.git
cd ai-marketplace
npm install
```

### 2. Setup Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Add environment variables
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add JWT_REFRESH_SECRET production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add TOSS_SECRET_KEY production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add SENDGRID_API_KEY production
vercel env add FROM_EMAIL production
vercel env add NEXT_PUBLIC_APP_URL production
```

### 3. Setup Supabase

```bash
# Create project at https://supabase.com
# Enable connection pooling
# Copy connection string to Vercel env

# Run migrations
DATABASE_URL="your-supabase-url" npx prisma migrate deploy
```

### 4. Configure Payment Providers

**Stripe**:
1. Go to https://dashboard.stripe.com
2. Switch to production mode
3. Get API keys → Add to Vercel
4. Setup webhook: `https://your-domain.com/api/webhooks/stripe`
5. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`

**TossPayments**:
1. Apply for production at https://developers.tosspayments.com
2. Get live credentials → Add to Vercel
3. Setup webhook: `https://your-domain.com/api/webhooks/toss`

### 5. Deploy

```bash
# Automated deployment
./scripts/deploy.sh production

# Or manual deployment
vercel --prod
```

## Quick Commands

```bash
# Deploy to production
./scripts/deploy.sh production

# Health check
./scripts/health-check.sh https://your-domain.com

# Rollback if needed
./scripts/rollback.sh

# Run migrations
DATABASE_URL=$PRODUCTION_DATABASE_URL npx prisma migrate deploy

# View logs
vercel logs

# List deployments
vercel ls
```

## Environment Variables Template

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:6543/postgres?pgbouncer=true"

# Authentication
JWT_SECRET="<generate-with-openssl-rand-base64-32>"
JWT_REFRESH_SECRET="<generate-with-openssl-rand-base64-32>"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# TossPayments
TOSS_SECRET_KEY="live_sk_..."
TOSS_CLIENT_KEY="live_ck_..."

# Supabase
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="eyJ..."

# Email
SENDGRID_API_KEY="SG...."
FROM_EMAIL="noreply@your-domain.com"

# App
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"

# Optional: Monitoring
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/xxx"
```

## Post-Deployment Checklist

### Immediate (0-1 hour)
- [ ] Health check passes
- [ ] Homepage loads correctly
- [ ] Authentication works
- [ ] Payment flow functional
- [ ] Email notifications sending
- [ ] No critical errors in Sentry

### First 24 Hours
- [ ] Error rate <0.1%
- [ ] API response time <500ms (P95)
- [ ] Payment success rate >99%
- [ ] User registrations working
- [ ] Zero P0 incidents

### First Week
- [ ] Performance optimizations applied
- [ ] User feedback collected
- [ ] Bug fixes deployed
- [ ] Documentation updated
- [ ] Team retrospective completed

## Monitoring URLs

- **Application**: https://your-domain.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **Sentry Dashboard**: https://sentry.io
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Status Page**: https://status.your-domain.com

## Emergency Contacts

- **On-Call Engineer**: oncall@your-domain.com
- **DevOps Team**: devops@your-domain.com
- **Security Team**: security@your-domain.com

## Troubleshooting

### Deployment Failed
```bash
# Check build logs
vercel logs

# Check environment variables
vercel env ls

# Verify database connection
DATABASE_URL="..." npx prisma db pull
```

### Health Check Failed
```bash
# Check API health
curl https://your-domain.com/api/health

# Check Vercel function logs
vercel logs --follow

# Check Sentry for errors
# Visit https://sentry.io/your-project
```

### Database Issues
```bash
# Check connection
DATABASE_URL="..." npx prisma db pull

# Run migrations
DATABASE_URL="..." npx prisma migrate deploy

# Check Supabase dashboard
# Visit https://app.supabase.com
```

### Payment Issues
```bash
# Check Stripe webhook logs
# Visit https://dashboard.stripe.com/webhooks

# Test webhook endpoint
curl -X POST https://your-domain.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Rollback Procedure

```bash
# 1. Run rollback script
./scripts/rollback.sh

# 2. Or manually via Vercel
vercel rollback

# 3. Check health after rollback
./scripts/health-check.sh https://your-domain.com

# 4. Investigate and fix
# - Review Sentry errors
# - Check deployment logs
# - Identify root cause

# 5. Redeploy when ready
./scripts/deploy.sh production
```

## Additional Resources

- **Full Deployment Guide**: [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)
- **Security Hardening**: [SECURITY_HARDENING.md](./SECURITY_HARDENING.md)
- **Monitoring Guide**: [MONITORING_GUIDE.md](./MONITORING_GUIDE.md)
- **Deployment Checklist**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Complete Summary**: [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)

## Support

Need help? Contact:
- **Slack**: #devops-support
- **Email**: devops@your-domain.com
- **Documentation**: https://docs.your-domain.com

---

**Last Updated**: 2025-12-28
**Version**: 1.0.0
