
# AI-Enabled Data Analytics Platform

Enterprise-grade data analytics and visualization platform with multi-tenancy, role-based access control, and AI-powered insights.

## Features

- 📊 **Data Management** - Upload CSV/Excel files, automatic schema detection
- 📈 **Dynamic Dashboards** - Create custom dashboards with multiple chart types
- 🤖 **AI Insights** - OpenAI GPT-5 powered insights and chat-based data exploration
- 🏢 **Multi-Tenancy** - Complete customer isolation with tenant-specific data
- 🔐 **Authentication** - Session-based auth with role-based access control
- 📱 **Modern UI** - React with shadcn/ui components, dark mode support
- 🚀 **Enterprise Ready** - Usage tracking, quotas, monitoring, and audit logs

## Tech Stack

- **Frontend:** React, TypeScript, TailwindCSS, shadcn/ui, Recharts
- **Backend:** Express, TypeScript, Node.js
- **Database:** PostgreSQL with Drizzle ORM
- **AI:** OpenAI GPT-5
- **Authentication:** bcrypt, express-session
- **Deployment:** Replit

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd <your-repo>
npm install
```

### 2. Configure Environment

Create `.env` file:

```bash
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=your-random-secret
OPENAI_API_KEY=sk-your-key (optional)
```

### 3. Run Database Migrations

```bash
npm run db:push
```

### 4. Start Development Server

```bash
npm run dev
```

Application runs on http://localhost:5000

## Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Testing Guide](./TESTING_GUIDE.md) - Testing strategy and examples
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Deploy to Replit
- [Monitoring Guide](./MONITORING_GUIDE.md) - Observability and alerts
- [Enterprise Guide](./ENTERPRISE_IMPLEMENTATION_GUIDE.md) - Enterprise features

## User Roles

- **Super Admin** - Platform-wide access, manage all customers
- **Customer Admin** - Manage users, configure AI, view customer usage
- **Analyst** - Create dashboards, upload data, use AI features
- **Viewer** - Read-only access to dashboards

## API Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"user","password":"pass123"}'
```

### Upload Dataset
```bash
curl -X POST http://localhost:5000/api/datasets \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{"name":"Sales","type":"csv","data":[...]}'
```

### Generate AI Insight
```bash
curl -X POST http://localhost:5000/api/insights/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{"datasetId":"dataset-id","type":"summary"}'
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Deployment

Deploy to Replit:

1. Push code to Replit
2. Configure environment variables in Secrets
3. Click "Deploy" button
4. Select deployment tier
5. Monitor via Deployments panel

See [Deployment Guide](./DEPLOYMENT_GUIDE.md) for details.

## Monitoring

- Application metrics: `/api/customers/:id/usage-stats`
- Health check: `/health`
- Error tracking in deployment logs

## License

MIT

## Support

For issues and questions, open a GitHub issue or contact support.
