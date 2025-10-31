
# AI-Enabled Data Analytics Platform - AiEnterpriseViz

Enterprise-grade data analytics and visualization platform with multi-tenancy, role-based access control, and AI-powered insights.

## Features

- 📊 **Data Management** - Upload CSV/Excel files, automatic schema detection
- 📈 **Dynamic Dashboards** - Create custom dashboards with 8+ chart types
- 🤖 **AI Insights** - OpenAI GPT-5 powered insights and chat-based data exploration
- 🏢 **Multi-Tenancy** - Complete customer isolation with tenant-specific data
- 🔐 **Authentication** - Session-based auth with role-based access control (5 roles)
- 📱 **Modern UI** - React with shadcn/ui components, dark/light mode support
- 🚀 **Enterprise Ready** - Usage tracking, quotas, monitoring, and audit logs
- 📊 **Advanced Analytics** - Trend analysis, forecasting, anomaly detection, seasonality
- 🔗 **Data Connectors** - REST API, GraphQL, Database connectors

## Tech Stack

- **Frontend:** React, TypeScript, TailwindCSS, shadcn/ui, Recharts
- **Backend:** Express, TypeScript, Node.js
- **Database:** PostgreSQL with Drizzle ORM (via Neon)
- **AI:** OpenAI GPT-5 with multi-provider support
- **Authentication:** bcrypt, express-session, PostgreSQL session store
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
ENCRYPTION_KEY=your-32-byte-hex-key
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

## Default Credentials

After first run, a super admin account is created:
- **Email:** admin@example.com
- **Password:** admin123

**⚠️ Change this password immediately in production!**

## Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Testing Guide](./TESTING_GUIDE.md) - Testing strategy and examples
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Deploy to Replit
- [Monitoring Guide](./MONITORING_GUIDE.md) - Observability and alerts
- [Enterprise Guide](./ENTERPRISE_IMPLEMENTATION_GUIDE.md) - Enterprise features
- [BI Dashboard Guide](./BI_DASHBOARD_IMPLEMENTATION_GUIDE.md) - Dashboard implementation

## User Roles

- **Super Admin** - Platform-wide access, manage all customers
- **Customer Admin** - Manage users, configure AI, view customer usage
- **Analyst** - Create dashboards, upload data, use AI features
- **Viewer** - Read-only access to dashboards
- **Developer** - API access, integration capabilities

## Key Features

### Data Management
- CSV/Excel file uploads with drag-and-drop
- Automatic schema detection and validation
- REST API data connector with authentication
- GraphQL API connector
- Database connectors (PostgreSQL, MySQL)
- Calculated fields and transformations

### Visualizations
- 8 chart types: Line, Bar, Area, Pie, Doughnut, Scatter, Radar, KPI
- Advanced chart configuration
- Custom color schemes (5 themes)
- Interactive tooltips and legends
- Responsive design

### Analytics
- Trend analysis with linear regression
- 5-period forecasting
- Anomaly detection (configurable sensitivity)
- Seasonality detection
- Multi-field aggregations (sum, avg, count, min, max, median)

### AI Features
- AI provider abstraction layer
- OpenAI GPT-4/GPT-5 integration
- Per-customer AI configuration
- Insight generation (summary, trend, anomaly, forecast)
- Chat with data interface
- Graceful degradation when AI not configured

### Enterprise Features
- Multi-tenant architecture with complete isolation
- Role-based access control (RBAC)
- Usage tracking (API calls, AI tokens, storage)
- Quotas and limits per customer
- Data encryption for sensitive fields
- Admin panel for customer management
- Dashboard templates and wizard

## API Examples

### Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"user","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user","password":"pass123"}' \
  -c cookies.txt
```

### Data Management
```bash
# Upload Dataset
curl -X POST http://localhost:5000/api/datasets \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Sales","type":"csv","data":[{"date":"2024-01-01","revenue":1000}]}'

# List Datasets
curl -X GET http://localhost:5000/api/datasets \
  -b cookies.txt
```

### AI Features
```bash
# Generate Insight
curl -X POST http://localhost:5000/api/insights/generate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"datasetId":"dataset-id","type":"summary"}'

# Chat with AI
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"messages":[{"role":"user","content":"Analyze sales trends"}]}'
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Deployment on Replit

1. Click "Deploy" button in Replit
2. Configure environment variables in Secrets
3. Database migrations run automatically on first deploy
4. Application available at your-app.replit.app

See [Deployment Guide](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## Project Structure

```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities and hooks
│   │   └── test/         # Test files
├── server/               # Express backend
│   ├── lib/              # Business logic
│   │   ├── ai-providers/ # AI integrations
│   │   ├── analytics/    # Analytics engines
│   │   └── data-connectors/ # Data source connectors
│   ├── middleware/       # Auth, RBAC, tracking
│   └── *-routes.ts       # API endpoints
└── shared/               # Shared types and schema
```

## Monitoring

- Application metrics: `/api/usage/stats`
- Health check: `/health`
- Database metrics: `/metrics/db` (authenticated)

## Security

- bcrypt password hashing (12 rounds)
- Session-based authentication
- CSRF protection
- SQL injection prevention (parameterized queries)
- API key encryption (AES-256-GCM)
- Rate limiting
- Input validation (Zod)

## Performance

- Target API response time: <200ms (p95)
- Chart render time: <500ms
- Page load time: <2s
- Supports 100+ concurrent users per customer

## License

MIT

## Support

For issues and questions, open a GitHub issue or contact support.

## Roadmap

- [ ] Real-time data updates via WebSockets
- [ ] Drag-and-drop dashboard layout editor
- [ ] PDF/PNG/Excel export
- [ ] Scheduled email reports
- [ ] Additional chart types (Heatmap, Funnel, Waterfall)
- [ ] Cross-chart filtering
- [ ] Cohort and funnel analysis
- [ ] Dashboard version control
