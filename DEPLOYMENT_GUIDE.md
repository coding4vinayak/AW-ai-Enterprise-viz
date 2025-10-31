
# Deployment Guide - Replit Platform

## Prerequisites

1. Replit account with Deployments enabled
2. PostgreSQL database provisioned
3. Environment variables configured

## Environment Variables

Required environment variables for production:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
SESSION_SECRET=your-64-char-random-string
JWT_SECRET=your-64-char-random-string

# Encryption (for API keys)
ENCRYPTION_KEY=your-32-byte-hex-key
ENCRYPTION_ALGORITHM=aes-256-gcm

# AI Provider (optional)
OPENAI_API_KEY=sk-your-openai-key

# Admin Setup (first run only)
SUPER_ADMIN_EMAIL=admin@yourcompany.com
SUPER_ADMIN_PASSWORD=strong-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Usage Tracking
USAGE_TRACKING_ENABLED=true
QUOTA_ENFORCEMENT_ENABLED=true
```

## Deployment Steps on Replit

### 1. Prepare the Application

Ensure your code is committed and pushed to the Replit workspace.

### 2. Configure Build Settings

The application uses these commands:

**Build Command:**
```bash
npm run build
```

**Run Command:**
```bash
npm start
```

### 3. Deploy from Replit

1. Click the "Deploy" button in the top right
2. Select "Deployments" from the dropdown
3. Choose your deployment tier (Shared, Dedicated, etc.)
4. Configure environment variables in the Secrets tab
5. Click "Deploy"

### 4. Health Check Configuration

The deployment health check verifies:
- Server responds on port 5000
- Database connection is active
- Critical routes are accessible

To bypass health check (for background jobs):
- Uncheck "Health check before promoting" during deployment

### 5. Monitor Deployment

Watch the deployment logs:
1. Go to Deployments panel
2. Click on your active deployment
3. View "Build Logs" tab for build process
4. View "Runtime Logs" for application logs

## Database Migration

Run migrations after deployment:

```bash
npm run db:push
```

This will:
- Create all necessary tables
- Set up indexes
- Run seed data (if configured)

## Post-Deployment Verification

### 1. Health Check

```bash
curl https://your-app.replit.app/api/auth/me
# Should return 401 (not authenticated) - server is working
```

### 2. Test Authentication

```bash
curl -X POST https://your-app.replit.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"test123"}'
```

### 3. Test Database

```bash
curl https://your-app.replit.app/api/datasets \
  -H "Cookie: your-session-cookie"
```

### 4. Test AI Features (if configured)

```bash
curl https://your-app.replit.app/api/ai/status
# Should return {"configured": true} if OpenAI key is set
```

## Custom Domain Setup

1. Go to Deployments panel
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning (automatic)

## Scaling

### Vertical Scaling
- Upgrade deployment tier for more CPU/memory
- Recommended: Dedicated machines for production

### Horizontal Scaling
- Not directly supported in Replit
- Use database connection pooling
- Implement caching layer (Redis)

## Monitoring

### Application Logs

View logs in Deployments panel:
- Build logs
- Runtime logs
- Error logs

### Performance Monitoring

Monitor key metrics:
- Response times
- Error rates
- Database query performance
- Memory usage
- CPU usage

### Custom Metrics

Application tracks:
- API calls per customer
- AI token usage
- Storage usage
- User activity

Access via:
```bash
GET /api/customers/:customerId/usage-stats?period=week
```

## Backup Strategy

### Database Backups

1. **Automated Backups** (Replit managed):
   - Daily backups retained for 7 days
   - Weekly backups retained for 30 days

2. **Manual Backups**:
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### File Storage Backups

- User-uploaded datasets stored in database (JSONB)
- Included in database backups
- No separate file storage needed

## Rollback Procedure

If deployment fails:

1. Go to Deployments panel
2. Click "Deployments" to view history
3. Select previous stable deployment
4. Click "Promote to production"

Or use version control:
```bash
git revert HEAD
git push
# Trigger new deployment
```

## Security Hardening

### 1. Environment Variables
- Never commit secrets to git
- Use Replit Secrets for sensitive data
- Rotate secrets regularly

### 2. Database Security
- Use strong database passwords
- Enable SSL for database connections
- Restrict database access by IP (if possible)

### 3. Application Security
- Rate limiting enabled by default
- Session cookies are httpOnly and secure
- CSRF protection for state-changing operations
- Input validation on all endpoints

### 4. Dependencies
```bash
npm audit
npm audit fix
```

## Troubleshooting

### Deployment Fails

**Build Error:**
- Check build logs for specific errors
- Verify all dependencies in package.json
- Ensure TypeScript compiles without errors

**Runtime Error:**
- Check runtime logs
- Verify environment variables are set
- Check database connection

### Application Not Responding

1. Check deployment status in Replit
2. View runtime logs for errors
3. Verify database connection
4. Check if server is binding to 0.0.0.0:5000

### Database Connection Issues

```bash
# Test database connection
psql $DATABASE_URL

# Check connection pool
# Add logging to server/db.ts
```

### High Memory Usage

- Check for memory leaks in long-running processes
- Verify database connection pool size
- Monitor AI chat sessions (can be memory-intensive)

## Performance Optimization

### 1. Database Optimization
- Add indexes for frequently queried columns
- Use database query caching
- Optimize N+1 queries

### 2. API Optimization
- Implement response caching
- Use pagination for large datasets
- Compress responses (gzip)

### 3. Frontend Optimization
- Code splitting
- Lazy loading components
- Image optimization
- Bundle size reduction

## Maintenance Windows

Schedule for:
- Database migrations
- Dependency updates
- Security patches

Recommended: Deploy during low-traffic periods.

## Support Contacts

- Replit Support: https://replit.com/support
- Database Provider Support: [Provider contact]
- Application Issues: [Your support email]

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] Super admin account created
- [ ] Health checks passing
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Security audit completed
- [ ] Load testing completed
- [ ] Documentation updated
