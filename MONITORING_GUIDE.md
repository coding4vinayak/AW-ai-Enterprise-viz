
# Monitoring & Observability Guide

## Overview

This guide covers monitoring, logging, alerting, and observability for the enterprise analytics platform.

## Monitoring Strategy

### Four Golden Signals

1. **Latency** - Request response times
2. **Traffic** - Request volume
3. **Errors** - Error rates
4. **Saturation** - Resource utilization

## Application Metrics

### Built-in Metrics Tracking

The application tracks:

#### API Metrics
```typescript
{
  customerId: "customer-uuid",
  metricType: "api_call",
  value: 1,
  metadata: {
    endpoint: "/api/datasets",
    method: "GET",
    duration: 45,
    statusCode: 200
  }
}
```

#### AI Token Usage
```typescript
{
  customerId: "customer-uuid",
  metricType: "ai_tokens",
  value: 1500,
  metadata: {
    provider: "openai",
    model: "gpt-4",
    promptTokens: 500,
    completionTokens: 1000
  }
}
```

#### Storage Usage
```typescript
{
  customerId: "customer-uuid",
  metricType: "storage",
  value: 1048576,
  metadata: {
    datasetId: "dataset-uuid",
    operation: "upload"
  }
}
```

### Access Metrics

**API Endpoint:**
```bash
GET /api/customers/:customerId/usage-stats?period=week
```

**Response:**
```json
{
  "api_calls": 5000,
  "ai_tokens": 150000,
  "storage": 5242880
}
```

## Logging

### Log Levels

- **ERROR** - Critical errors requiring immediate attention
- **WARN** - Warning conditions
- **INFO** - Informational messages
- **DEBUG** - Detailed debugging information

### Log Format

All logs follow structured JSON format:

```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "INFO",
  "service": "api-server",
  "message": "User login successful",
  "metadata": {
    "userId": "user-uuid",
    "customerId": "customer-uuid",
    "ip": "192.168.1.1"
  }
}
```

### Application Logs

#### Authentication Logs
```typescript
console.log('Authentication successful', {
  userId: user.id,
  customerId: user.customerId,
  role: user.role
});
```

#### Error Logs
```typescript
console.error('Database query failed', {
  query: 'SELECT * FROM datasets',
  error: error.message,
  stack: error.stack
});
```

#### Performance Logs
```typescript
const start = Date.now();
// ... operation
console.log('Operation completed', {
  operation: 'dataset_upload',
  duration: Date.now() - start,
  rowCount: data.length
});
```

### Accessing Logs

**Replit Deployment Logs:**
1. Go to Deployments panel
2. Select active deployment
3. Click "Runtime Logs" tab

**Filter logs:**
```bash
# Error logs only
grep ERROR runtime.log

# Specific user activity
grep "user-uuid" runtime.log

# Last 100 lines
tail -n 100 runtime.log
```

## Performance Monitoring

### Response Time Tracking

Monitor endpoint response times:

```typescript
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log('Request completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
    });
  });
  next();
});
```

### Database Query Performance

Track slow queries:

```typescript
// Add to storage.ts
const logQuery = (operation: string, duration: number) => {
  if (duration > 1000) {
    console.warn('Slow query detected', {
      operation,
      duration,
      threshold: 1000
    });
  }
};
```

### Memory Usage

Monitor Node.js memory:

```typescript
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory usage', {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
    external: Math.round(usage.external / 1024 / 1024) + 'MB'
  });
}, 300000); // Every 5 minutes
```

## Health Checks

### Endpoint Health Check

```typescript
// server/index.ts
app.get('/health', async (req, res) => {
  try {
    // Check database
    await db.execute('SELECT 1');
    
    // Check AI provider (if configured)
    const aiStatus = isOpenAIConfigured();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        ai: aiStatus ? 'up' : 'not_configured'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### Monitor Health Check

```bash
curl https://your-app.replit.app/health
```

## Error Tracking

### Error Categories

1. **4xx Client Errors**
   - 400 Bad Request
   - 401 Unauthorized
   - 403 Forbidden
   - 404 Not Found

2. **5xx Server Errors**
   - 500 Internal Server Error
   - 503 Service Unavailable

### Error Logging

```typescript
app.use((err, req, res, next) => {
  console.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    customerId: req.user?.customerId
  });
  
  res.status(err.status || 500).json({
    error: err.message
  });
});
```

### Error Rate Tracking

Track error rates:

```typescript
let errorCount = 0;
let totalRequests = 0;

setInterval(() => {
  const errorRate = (errorCount / totalRequests) * 100;
  console.log('Error rate', {
    errorRate: errorRate.toFixed(2) + '%',
    errorCount,
    totalRequests
  });
  errorCount = 0;
  totalRequests = 0;
}, 60000); // Every minute
```

## Alerting

### Critical Alerts

Set up alerts for:

1. **High Error Rate** (>5% for 5 minutes)
2. **Database Connection Lost**
3. **Memory Usage >90%**
4. **Response Time >2000ms (p95)**
5. **Deployment Failure**

### Alert Channels

- Email notifications
- Slack/Discord webhooks
- SMS (for critical alerts)

### Example Alert Configuration

```typescript
if (errorRate > 5) {
  sendAlert({
    level: 'critical',
    title: 'High Error Rate Detected',
    message: `Error rate: ${errorRate}%`,
    service: 'api-server'
  });
}
```

## Dashboard Metrics

### System Metrics Dashboard

Track:
- Total Users
- Total Customers
- Total Datasets
- Total Dashboards
- API Calls (24h)
- AI Tokens Used (24h)
- Active Sessions

### Customer Metrics Dashboard

Per customer tracking:
- Datasets Created
- Dashboards Created
- API Calls
- AI Token Usage
- Storage Used
- Active Users

Access via `/usage` page in the application.

## Database Monitoring

### Connection Pool

Monitor database connections:

```typescript
import { pool } from './db';

app.get('/metrics/db', async (req, res) => {
  res.json({
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingClients: pool.waitingCount
  });
});
```

### Query Performance

Track slow queries in PostgreSQL:

```sql
-- Enable slow query logging
ALTER DATABASE your_db SET log_min_duration_statement = 1000;

-- View slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Performance Benchmarks

### Target Metrics

- API Response Time (p95): <200ms
- Database Query Time (p95): <100ms
- AI Insight Generation: <5s
- Page Load Time: <2s
- Time to Interactive: <3s

### Load Testing Results

Document baseline performance:

```
Endpoint: GET /api/datasets
Concurrent Users: 100
Average Response Time: 45ms
95th Percentile: 120ms
Errors: 0%
```

## Incident Response

### Response Procedure

1. **Detect** - Alert triggers
2. **Assess** - Check logs and metrics
3. **Mitigate** - Apply quick fix
4. **Resolve** - Deploy permanent fix
5. **Review** - Post-mortem analysis

### Incident Log Template

```markdown
## Incident: [Title]

**Date:** 2024-01-01
**Duration:** 30 minutes
**Impact:** High error rate on /api/datasets endpoint
**Root Cause:** Database connection pool exhaustion
**Resolution:** Increased connection pool size from 10 to 20
**Action Items:**
- [ ] Add connection pool monitoring
- [ ] Implement circuit breaker pattern
- [ ] Update runbook
```

## Monitoring Checklist

Daily:
- [ ] Check error rates
- [ ] Review slow queries
- [ ] Monitor memory usage
- [ ] Check deployment status

Weekly:
- [ ] Review usage trends
- [ ] Analyze performance metrics
- [ ] Check quota utilization
- [ ] Update dashboards

Monthly:
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Cost analysis
- [ ] Backup verification

## Tools & Integrations

Recommended monitoring tools:

1. **Application Monitoring**
   - New Relic
   - Datadog
   - Sentry (for error tracking)

2. **Database Monitoring**
   - pganalyze
   - PostgreSQL built-in stats

3. **Log Management**
   - Logtail
   - Papertrail
   - CloudWatch Logs

4. **Uptime Monitoring**
   - UptimeRobot
   - Pingdom
   - StatusCake

## Best Practices

1. **Log Everything Important**
   - User actions
   - System events
   - Errors and warnings
   - Performance metrics

2. **Alert on Actionable Items**
   - Don't alert on noise
   - Set appropriate thresholds
   - Include context in alerts

3. **Monitor User Experience**
   - Track real user metrics
   - Monitor error rates
   - Measure performance

4. **Regular Review**
   - Weekly metrics review
   - Monthly trend analysis
   - Quarterly optimization

5. **Documentation**
   - Keep runbooks updated
   - Document incidents
   - Share learnings
