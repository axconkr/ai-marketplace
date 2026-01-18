# Production Environment Setup

## 1. Vercel Setup

### Create New Project
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub: `ai-marketplace`
4. Configure project:
   - Framework: Next.js
   - Root Directory: `./`
   - Build Command: `npx prisma generate && npm run build`
   - Output Directory: `.next`

### Environment Variables
Add in Vercel dashboard:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_REFRESH_SECRET=<generate-with-openssl-rand-base64-32>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
TOSS_SECRET_KEY=live_sk_...
TOSS_CLIENT_KEY=live_ck_...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SENDGRID_API_KEY=SG....
FROM_EMAIL=noreply@aimarketplace.com
NEXT_PUBLIC_APP_URL=https://aimarketplace.com
NODE_ENV=production
```

## 2. Supabase Setup

### Create New Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project: "ai-marketplace-prod"
3. Choose region: Seoul (ap-northeast-2)
4. Set strong database password

### Configure Database
```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create database user for application
CREATE USER aimarketplace WITH PASSWORD 'strong-password';
GRANT ALL PRIVILEGES ON DATABASE postgres TO aimarketplace;
```

### Run Migrations
```bash
DATABASE_URL=<supabase-url> npx prisma migrate deploy
```

### Setup Connection Pooling
1. Go to Project Settings > Database
2. Enable Connection Pooling
3. Use pooling URL for application:
   ```
   postgres://[user]:[password]@[host]:6543/postgres?pgbouncer=true
   ```

## 3. Stripe Setup

### Production Mode
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Toggle to "Production" mode
3. Get API keys from Developers > API keys

### Configure Webhooks
1. Go to Developers > Webhooks
2. Add endpoint: `https://aimarketplace.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy webhook secret to Vercel env

### Test Payment Flow
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 4. TossPayments Setup

### Production Credentials
1. Go to [TossPayments Developer Center](https://developers.tosspayments.com)
2. Apply for production approval
3. Get live API keys
4. Configure in Vercel

### Configure Webhooks
- URL: `https://aimarketplace.com/api/webhooks/toss`
- Events: payment confirmation, cancellation

## 5. SendGrid Setup

### Email Configuration
1. Create account at [sendgrid.com](https://sendgrid.com)
2. Verify sender identity: noreply@aimarketplace.com
3. Create API key with Mail Send permissions
4. Add to Vercel environment variables

### Email Templates
Create templates for:
- Welcome email
- Order confirmation
- Payment receipt
- Verification complete
- Settlement notification

## 6. Monitoring Setup

### Sentry (Error Tracking)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Add to `.env.production`:
```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### Vercel Analytics
1. Enable in Project Settings
2. Add to app:
   ```typescript
   // app/layout.tsx
   import { Analytics } from '@vercel/analytics/react';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

### UptimeRobot
1. Create account at [uptimerobot.com](https://uptimerobot.com)
2. Add monitor:
   - URL: https://aimarketplace.com/api/health
   - Interval: 5 minutes
   - Alert contacts: team emails

## 7. Domain Setup

### DNS Configuration
```
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
TXT   @     verification-code
```

### SSL Certificate
- Automatically provided by Vercel
- Force HTTPS in `next.config.js`:
  ```javascript
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ];
  }
  ```

## 8. Security Hardening

### Environment
- Rotate all secrets before production
- Never commit secrets to Git
- Use Vercel secret storage
- Enable 2FA on all accounts

### Application
- Enable rate limiting
- Configure CORS properly
- Add security headers
- Implement CSP policy

### Database
- Use read replicas for scaling
- Enable automated backups (daily)
- Set up point-in-time recovery
- Restrict database access to application IPs

## 9. Backup Strategy

### Database Backups
```bash
# Automated daily backup (add to cron)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
aws s3 cp backup_$(date +%Y%m%d).sql s3://ai-marketplace-backups/
```

### File Storage
- Supabase Storage has automatic backups
- Configure retention: 30 days
- Test restore process monthly

## 10. Launch Day

### Final Checks
- [ ] All services green in monitoring
- [ ] Database migrations applied
- [ ] Cache warmed up
- [ ] Email delivery tested
- [ ] Payment systems tested
- [ ] Team on standby

### Go Live
```bash
# Deploy to production
vercel --prod

# Verify deployment
curl https://aimarketplace.com/api/health
```

### Post-Launch Monitoring
- Monitor error rates (target: <0.1%)
- Check API response times (<500ms)
- Verify payment processing
- Watch database performance
- Respond to user feedback
