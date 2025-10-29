
# API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-app.replit.app/api`

## Authentication

All authenticated endpoints require a valid session cookie.

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "securePassword123",
  "customerId": "optional-customer-id"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "role": "viewer",
    "customerId": "customer-id"
  }
}
```

**Errors:**
- 400: Missing required fields
- 409: Email or username already exists
- 500: Registration failed

### POST /auth/login
Authenticate a user.

**Request Body:**
```json
{
  "identifier": "user@example.com or username",
  "password": "password"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "role": "analyst",
    "customerId": "customer-id"
  }
}
```

**Errors:**
- 400: Missing credentials
- 401: Invalid credentials
- 403: Account not active

### POST /auth/logout
Logout current user.

**Response (200):**
```json
{
  "success": true
}
```

### GET /auth/me
Get current authenticated user.

**Headers:** Requires authentication

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "role": "analyst",
  "customerId": "customer-id",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## Datasets

### POST /datasets
Upload a new dataset.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "name": "Sales Data Q1",
  "type": "csv",
  "data": [
    {"date": "2024-01-01", "revenue": 1000, "region": "North"},
    {"date": "2024-01-02", "revenue": 1200, "region": "South"}
  ]
}
```

**Response (200):**
```json
{
  "id": "dataset-uuid",
  "name": "Sales Data Q1",
  "type": "csv",
  "rowCount": 2,
  "schemaInfo": {
    "columns": [
      {"name": "date", "type": "date"},
      {"name": "revenue", "type": "number"},
      {"name": "region", "type": "string"}
    ]
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /datasets
List all datasets for authenticated user's customer.

**Headers:** Requires authentication

**Response (200):**
```json
[
  {
    "id": "dataset-uuid",
    "name": "Sales Data Q1",
    "type": "csv",
    "rowCount": 100,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### GET /datasets/:id
Get dataset by ID.

**Headers:** Requires authentication

**Response (200):**
```json
{
  "id": "dataset-uuid",
  "name": "Sales Data Q1",
  "uploadedData": [...],
  "schemaInfo": {...}
}
```

### DELETE /datasets/:id
Delete a dataset.

**Headers:** Requires authentication (analyst, customer_admin, or super_admin role)

**Response (200):**
```json
{
  "success": true
}
```

## Dashboards

### POST /dashboards
Create a new dashboard.

**Headers:** Requires authentication (analyst, customer_admin, or super_admin role)

**Request Body:**
```json
{
  "name": "Sales Overview",
  "description": "Q1 2024 Sales Dashboard",
  "layout": {...}
}
```

### GET /dashboards
List all dashboards.

**Headers:** Requires authentication

### GET /dashboards/:id
Get dashboard by ID.

### PUT /dashboards/:id
Update dashboard.

### DELETE /dashboards/:id
Delete dashboard.

## Charts

### POST /charts
Create a chart.

**Headers:** Requires authentication (analyst, customer_admin, or super_admin role)

**Request Body:**
```json
{
  "dashboardId": "dashboard-uuid",
  "datasetId": "dataset-uuid",
  "type": "line",
  "title": "Revenue Trend",
  "config": {
    "metric": "revenue",
    "xAxis": "date",
    "yAxis": "revenue",
    "aggregation": "sum"
  }
}
```

### GET /charts?dashboardId=:id
List charts for a dashboard.

### PUT /charts/:id
Update chart.

### DELETE /charts/:id
Delete chart.

## AI Features

### POST /insights/generate
Generate AI insights.

**Headers:** Requires authentication (analyst, customer_admin, or super_admin role)

**Request Body:**
```json
{
  "datasetId": "dataset-uuid",
  "type": "summary"
}
```

**Response (200):**
```json
{
  "configured": true,
  "insight": {
    "id": "insight-uuid",
    "type": "summary",
    "content": "AI-generated insight text...",
    "generatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### POST /chat
Chat with AI about data.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "messages": [
    {"role": "user", "content": "What are the top trends?"}
  ],
  "datasetId": "optional-dataset-uuid"
}
```

**Response (200):**
```json
{
  "configured": true,
  "message": "AI response..."
}
```

### GET /ai/status
Check if AI is configured.

**Response (200):**
```json
{
  "configured": true
}
```

## Admin Routes

### GET /admin/customers
List all customers (super_admin only).

### POST /admin/customers
Create a new customer (super_admin only).

### PATCH /admin/customers/:id
Update customer (super_admin only).

### GET /admin/customers/:customerId/users
List users for a customer.

### GET /admin/customers/:customerId/usage
Get usage statistics.

## AI Configuration

### GET /llm-providers
List available LLM providers.

### GET /customers/:customerId/ai-config
Get customer's AI configuration.

### POST /customers/:customerId/ai-config
Set AI configuration.

**Request Body:**
```json
{
  "providerId": "provider-uuid",
  "apiKey": "your-api-key",
  "model": "gpt-4",
  "settings": {
    "temperature": 0.7,
    "maxTokens": 2000
  }
}
```

### POST /customers/:customerId/ai-config/test
Test AI configuration.

## Usage Tracking

### GET /customers/:customerId/usage-stats?period=week
Get usage statistics.

**Query Params:**
- period: 'day' | 'week' | 'month'

**Response (200):**
```json
{
  "api_calls": 1000,
  "ai_tokens": 50000,
  "storage": 0
}
```

### GET /customers/:customerId/quotas
Get quota information.

## Error Responses

All endpoints may return these error responses:

**400 Bad Request:**
```json
{
  "error": "Missing required fields"
}
```

**401 Unauthorized:**
```json
{
  "error": "Not authenticated"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

API rate limits:
- 100 requests per 15 minutes per user
- 1000 AI tokens per hour per customer

## Webhooks

Coming in future release.
