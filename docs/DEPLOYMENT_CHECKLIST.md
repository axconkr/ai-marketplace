# Production Deployment Checklist

## Pre-Deployment

### Code Quality
- [ ] All tests passing (unit + E2E + integration)
- [ ] Code coverage ≥80%
- [ ] No high-severity security vulnerabilities
- [ ] No console.logs or debug code
- [ ] TypeScript strict mode enabled
- [ ] ESLint passing with no warnings

### Database
- [ ] All migrations tested in staging
- [ ] Backup strategy implemented
- [ ] Database indexes optimized
- [ ] Connection pooling configured
- [ ] Database credentials secured

### Environment Variables
- [ ] All production secrets set in Vercel
- [ ] Stripe production keys configured
- [ ] TossPayments production keys configured
- [ ] Supabase production database URL
- [ ] SendGrid API key for production
- [ ] OAuth credentials (Google, GitHub) configured
- [ ] JWT secrets rotated for production

### Security
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers
- [ ] Input validation on all endpoints
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Password hashing verified (bcrypt)

### Performance
- [ ] Image optimization enabled
- [ ] Bundle size optimized (<500KB initial)
- [ ] CDN configured for static assets
- [ ] Database queries optimized
- [ ] Redis caching configured
- [ ] Lighthouse score >90

### Monitoring
- [ ] Sentry error tracking configured
- [ ] Vercel Analytics enabled
- [ ] Database monitoring (Supabase)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Alert notifications configured

### Payment Systems
- [ ] Stripe webhook endpoint verified
- [ ] TossPayments webhook endpoint verified
- [ ] Test transactions completed successfully
- [ ] Refund process tested
- [ ] Settlement calculation verified

### Legal & Compliance
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] GDPR compliance verified
- [ ] Cookie consent implemented
- [ ] Data retention policy documented

## Deployment Steps

1. **Create production branch**
   ```bash
   git checkout -b production
   git push origin production
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Run database migrations**
   ```bash
   DATABASE_URL=$PRODUCTION_DATABASE_URL npx prisma migrate deploy
   ```

4. **Verify deployment**
   - [ ] Health check endpoint responding
   - [ ] Homepage loading correctly
   - [ ] Authentication working
   - [ ] Payment flow functional
   - [ ] Email notifications sending

5. **Monitor for issues**
   - [ ] Check Sentry for errors
   - [ ] Monitor server logs
   - [ ] Check database performance
   - [ ] Verify API response times

## Post-Deployment

### Immediate (0-1 hour)
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Check API response times
- [ ] Verify webhook deliveries

### Short-term (1-24 hours)
- [ ] Monitor user registrations
- [ ] Check payment processing
- [ ] Verify email delivery
- [ ] Review error logs

### Medium-term (1-7 days)
- [ ] Analyze user behavior
- [ ] Review performance metrics
- [ ] Check database growth
- [ ] Collect user feedback

## Rollback Plan

If critical issues occur:

1. **Immediate rollback**
   ```bash
   vercel rollback
   ```

2. **Database rollback** (if needed)
   ```bash
   npx prisma migrate reset
   ```

3. **Notify users**
   - Post status update
   - Send email notification
   - Update social media

4. **Investigate and fix**
   - Review error logs
   - Identify root cause
   - Prepare hotfix
   - Test thoroughly

5. **Redeploy**
   - Deploy fix to staging
   - Run full test suite
   - Deploy to production
   - Monitor closely

## Support Contacts

- **DevOps Lead**: devops@aimarketplace.com
- **Database Admin**: dba@aimarketplace.com
- **Security Team**: security@aimarketplace.com
- **On-Call Engineer**: +82-10-XXXX-XXXX

## Emergency Procedures

### Database Emergency
1. Contact DBA immediately
2. Enable read-only mode if needed
3. Restore from latest backup
4. Verify data integrity

### Security Breach
1. Contact security team
2. Rotate all credentials
3. Review access logs
4. Notify affected users
5. File incident report

### Payment System Failure
1. Enable maintenance mode
2. Contact Stripe/Toss support
3. Process manual settlements if needed
4. Notify affected sellers

## Success Criteria

- [ ] Zero critical errors in first 24 hours
- [ ] API response time <500ms (P95)
- [ ] Page load time <3s (P95)
- [ ] Error rate <0.1%
- [ ] User registration working
- [ ] Payment processing working
- [ ] Positive initial user feedback
