# AI-Enabled Data Analytics Platform

## Overview

This is an enterprise-grade data analytics and visualization platform that allows users to connect multiple data sources (CSV, Excel), create customizable dashboards with dynamic charts, and leverage AI-powered insights for data analysis. The platform features a modern React frontend with shadcn/ui components, an Express/TypeScript backend, PostgreSQL database via Drizzle ORM, and OpenAI GPT-5 integration for natural language insights and chat-based data exploration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing

**UI Design System:**
- shadcn/ui component library with Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- "New York" style variant with neutral base colors
- Custom theme system supporting light/dark modes via CSS variables
- Typography: Inter font family for UI, JetBrains Mono for data/metrics
- Design inspired by Linear (typography), Grafana (dashboards), Notion (data organization), and Vercel Analytics (visualizations)

**State Management:**
- TanStack Query (React Query) for server state management and data fetching
- Local component state with React hooks
- Theme context provider for dark/light mode toggling

**Data Visualization:**
- Recharts library for charts (line, bar, pie, area, scatter)
- Custom chart builder component for dynamic visualization creation
- KPI cards with sparklines for at-a-glance metrics

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- ESM modules throughout the codebase
- Custom middleware for request logging and JSON parsing

**API Design:**
- RESTful API endpoints organized by resource type:
  - `/api/datasets` - Data source management
  - `/api/dashboards` - Dashboard CRUD operations
  - `/api/charts` - Chart configuration management
  - `/api/insights` - AI-generated insights
  - `/api/custom-metrics` - User-defined metric calculations

**File Upload Processing:**
- CSV parsing via PapaParse library
- Excel file processing via ExcelJS
- Automatic schema detection from uploaded data
- Storage of parsed data as JSONB in PostgreSQL

### Data Storage

**Database:**
- PostgreSQL via Neon serverless driver
- Drizzle ORM for type-safe database queries
- WebSocket-based connection pooling for serverless environments

**Schema Design:**
- `users` - User authentication data
- `datasets` - Uploaded data sources with schema metadata and row data stored as JSONB
- `dashboards` - User dashboard configurations with optional preset flag
- `charts` - Individual chart configurations linked to datasets and dashboards
- `insights` - AI-generated insights with type, severity, and confidence scores
- `customMetrics` - User-defined calculated metrics

**Design Rationale:**
- JSONB storage for flexible schema-less data from various sources
- Denormalized chart configurations for fast dashboard rendering
- Separate insights table for audit trail and historical analysis

### AI/ML Integration

**OpenAI Integration:**
- GPT-5 model for text generation (latest as of August 2025)
- Two primary AI features:
  1. **Insight Generation** - Analyzes data context to provide trends, forecasts, anomalies, and summaries
  2. **Chat Assistant** - Natural language interface for data exploration and report generation

**Implementation:**
- Lazy initialization of OpenAI client (only when API key is configured)
- Graceful degradation when AI features are unavailable
- Configurable API key via Settings page (stored in environment variables)

**AI Features:**
- Automatic insight generation from dataset analysis
- Multi-turn conversational interface for data queries
- Confidence scoring for AI-generated insights
- Type classification (trend, anomaly, forecast, summary)

### Authentication & Security

**Current State:**
- User schema exists in database with username/password fields
- No active authentication middleware implemented yet
- Session management infrastructure present (connect-pg-simple for PostgreSQL session store)

**Intended Architecture:**
- Session-based authentication with PostgreSQL session storage
- Potential integration with Clerk, Auth0, or Supabase Auth as mentioned in design docs
- Multi-tenant support via userId foreign keys in dashboards

## External Dependencies

### Third-Party Services

**Required:**
- **Neon Database** - Serverless PostgreSQL hosting (DATABASE_URL environment variable)
- **OpenAI API** - GPT-5 access for AI features (OPENAI_API_KEY environment variable, optional)

### Key NPM Packages

**Frontend:**
- `@radix-ui/*` - Headless UI component primitives (30+ packages)
- `recharts` - Charting library for data visualizations
- `@tanstack/react-query` - Server state management
- `wouter` - Lightweight routing
- `papaparse` - CSV parsing
- `date-fns` - Date formatting and manipulation
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` & `clsx` - Dynamic className composition

**Backend:**
- `express` - Web server framework
- `drizzle-orm` - TypeScript ORM
- `@neondatabase/serverless` - Neon database driver with WebSocket support
- `openai` - Official OpenAI SDK
- `exceljs` - Excel file parsing
- `connect-pg-simple` - PostgreSQL session store
- `zod` - Runtime type validation
- `drizzle-zod` - Drizzle to Zod schema conversion

**Development:**
- `vite` - Build tool and dev server
- `tsx` - TypeScript execution for development
- `esbuild` - Production server bundling
- `@replit/*` plugins - Replit-specific development tools

### Database Migrations

- Drizzle Kit for schema migrations
- Migration files stored in `/migrations` directory
- Push-based deployment via `db:push` script (applies schema changes directly)