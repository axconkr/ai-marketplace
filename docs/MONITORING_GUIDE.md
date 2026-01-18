# Production Monitoring Guide

## Overview

Comprehensive monitoring strategy for the AI Marketplace production environment covering error tracking, performance monitoring, uptime monitoring, and business metrics.

## 1. Error Tracking (Sentry)

### Setup
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Configuration
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
});
```

### Alert Rules
- **Critical Errors** (immediate notification)
  - Payment processing failures
  - Database connection errors
  - Authentication system failures

- **High Priority** (15 min notification)
  - API endpoint errors >1%
  - File upload failures
  - Email delivery failures

- **Medium Priority** (1 hour notification)
  - Validation errors >5%
  - Rate limit violations
  - Third-party API failures

### Monitoring Checklist
- [ ] Error rate trends (target: <0.1%)
- [ ] New error types
- [ ] Error spike patterns
- [ ] User impact assessment
- [ ] Resolution time tracking

## 2. Performance Monitoring

### Vercel Analytics

**Key Metrics**:
- Page load time (target: <3s P95)
- Time to First Byte (target: <500ms)
- First Contentful Paint (target: <1.5s)
- Largest Contentful Paint (target: <2.5s)
- Cumulative Layout Shift (target: <0.1)
- First Input Delay (target: <100ms)

**Setup**:
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Database Performance (Supabase)

**Monitoring Points**:
- Connection pool utilization
- Query execution time
- Slow query log (>1s)
- Index usage efficiency
- Table growth rate
- Deadlock frequency

**Query Performance**:
```sql
-- Find slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

### API Response Times

**Endpoints to Monitor**:
- `POST /api/auth/login` (target: <200ms)
- `GET /api/prompts` (target: <500ms)
- `POST /api/payments/charge` (target: <1s)
- `POST /api/prompts/upload` (target: <2s)
- `GET /api/users/profile` (target: <300ms)

**Alerting Thresholds**:
- P50 >500ms: Warning
- P95 >1s: High priority
- P99 >2s: Critical

## 3. Uptime Monitoring (UptimeRobot)

### Monitors Configuration

**Health Check Endpoint**:
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Database health check
    await prisma.$queryRaw`SELECT 1`;

    // Check critical services
    const checks = {
      database: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
    };

    return NextResponse.json(checks, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Service unhealthy' },
      { status: 503 }
    );
  }
}
```

**Monitor Setup**:
- URL: https://aimarketplace.com/api/health
- Type: HTTP(s)
- Interval: 5 minutes
- Timeout: 30 seconds
- HTTP Method: GET
- Expected Status: 200

**Alert Channels**:
- Email: devops@aimarketplace.com
- SMS: Emergency on-call number
- Slack: #alerts channel
- PagerDuty: Critical incidents

### Status Page
Create public status page at https://status.aimarketplace.com

**Components to Track**:
- Website availability
- API endpoints
- Payment processing
- File uploads
- Email delivery
- Database operations

## 4. Business Metrics

### Key Performance Indicators (KPIs)

**User Metrics**:
- Daily/Monthly Active Users (DAU/MAU)
- User registration rate
- User retention rate (D1, D7, D30)
- User churn rate

**Prompt Metrics**:
- Prompts uploaded per day
- Prompts verified per day
- Average verification time
- Prompt approval rate
- Popular categories

**Transaction Metrics**:
- Gross Merchandise Value (GMV)
- Transaction success rate
- Average transaction value
- Payment method distribution
- Refund rate

**Revenue Metrics**:
- Daily/Monthly Recurring Revenue (MRR)
- Average Revenue Per User (ARPU)
- Platform commission earned
- Settlement completion rate

### Analytics Dashboard

**Tools**:
- Vercel Analytics (web analytics)
- Custom admin dashboard (business metrics)
- Supabase dashboard (database metrics)
- Stripe dashboard (payment metrics)

**Custom Events Tracking**:
```typescript
// lib/analytics.ts
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }
};

// Usage examples
trackEvent('prompt_uploaded', { category: 'ai-art', price: 5000 });
trackEvent('purchase_completed', { amount: 5000, paymentMethod: 'stripe' });
trackEvent('search_performed', { query: 'chatgpt prompts', resultsCount: 23 });
```

## 5. Log Management

### Structured Logging

**Winston Configuration**:
```typescript
// lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'combined.log'
    }),
  ],
});

export default logger;
```

**Usage**:
```typescript
import logger from '@/lib/logger';

logger.info('User logged in', { userId, timestamp: Date.now() });
logger.warn('Rate limit approached', { ip, requests: 95 });
logger.error('Payment failed', { error, orderId, userId });
```

### Log Retention Policy
- **Critical Logs**: 90 days
- **Error Logs**: 60 days
- **Info Logs**: 30 days
- **Debug Logs**: 7 days

## 6. Alert Management

### Alert Severity Levels

**P0 - Critical** (Immediate Response)
- Production system down
- Data loss detected
- Security breach
- Payment system failure

**P1 - High** (15 min Response)
- API error rate >1%
- Database performance degraded
- Critical feature unavailable
- Payment webhook failures

**P2 - Medium** (1 hour Response)
- Elevated error rates
- Performance degradation
- Non-critical feature issues
- Third-party service issues

**P3 - Low** (Next Business Day)
- Minor bugs
- Documentation issues
- Performance optimization opportunities

### On-Call Rotation

**Schedule**:
- Primary: Week rotation
- Secondary: Week rotation
- Escalation: Engineering Manager

**Response Times**:
- P0: Immediate (within 5 minutes)
- P1: 15 minutes
- P2: 1 hour
- P3: Next business day

## 7. Incident Response

### Incident Workflow

1. **Detection**
   - Alert triggered
   - User report
   - Proactive monitoring

2. **Triage**
   - Assess severity
   - Identify impact
   - Assign responder

3. **Investigation**
   - Review logs
   - Check metrics
   - Reproduce issue

4. **Mitigation**
   - Apply hotfix
   - Rollback if needed
   - Communicate status

5. **Resolution**
   - Verify fix
   - Monitor stability
   - Document incident

6. **Post-Mortem**
   - Root cause analysis
   - Action items
   - Process improvements

### Incident Template

```markdown
# Incident Report: [YYYY-MM-DD] [Brief Description]

## Summary
- **Severity**: P0/P1/P2/P3
- **Start Time**: YYYY-MM-DD HH:MM UTC
- **End Time**: YYYY-MM-DD HH:MM UTC
- **Duration**: X hours Y minutes
- **Impact**: Number of affected users/transactions

## Timeline
- HH:MM - Alert triggered
- HH:MM - Investigation started
- HH:MM - Root cause identified
- HH:MM - Fix applied
- HH:MM - Service restored

## Root Cause
[Detailed explanation]

## Resolution
[Steps taken to resolve]

## Prevention
- [ ] Action item 1
- [ ] Action item 2
- [ ] Action item 3

## Lessons Learned
[Key takeaways]
```

## 8. Monitoring Checklist

### Daily
- [ ] Check error rates in Sentry
- [ ] Review API response times
- [ ] Monitor transaction success rate
- [ ] Check uptime status
- [ ] Review critical alerts

### Weekly
- [ ] Analyze performance trends
- [ ] Review slow database queries
- [ ] Check disk space usage
- [ ] Review security alerts
- [ ] Analyze business metrics

### Monthly
- [ ] Review incident reports
- [ ] Update monitoring thresholds
- [ ] Optimize alert rules
- [ ] Capacity planning review
- [ ] Performance optimization planning

## 9. Tools & Services

### Required Services
- **Sentry**: Error tracking and monitoring
- **Vercel Analytics**: Web analytics and performance
- **UptimeRobot**: Uptime monitoring and alerting
- **Supabase Dashboard**: Database monitoring
- **Stripe Dashboard**: Payment monitoring

### Optional Enhancements
- **Datadog**: Advanced APM and infrastructure monitoring
- **PagerDuty**: Incident management and on-call rotation
- **Grafana**: Custom dashboards and visualization
- **LogRocket**: Session replay and user monitoring

## 10. Monitoring Budget

### Cost Estimates (Monthly)
- Sentry (Team Plan): $26/month
- Vercel Analytics: Included with Pro plan
- UptimeRobot (Pro Plan): $7/month
- Supabase (Pro Plan): $25/month
- Total: ~$60/month

### ROI Justification
- Reduced downtime (99.9% uptime)
- Faster incident resolution
- Improved user experience
- Data-driven optimization
- Preventive issue detection
