
# Complete API Testing Guide with Mock Data

## Prerequisites
```bash
# Login first to get session cookie
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@example.com",
    "password": "admin123"
  }' \
  -c cookies.txt
```

## 1. USAGE & METRICS APIs

### Get Usage Stats
```bash
curl -X GET "http://localhost:5000/api/usage/stats?period=week" \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "api_calls": 1250,
  "ai_tokens": 45000,
  "storage": 10485760
}
```

### Get Customer Usage Data
```bash
curl -X GET http://localhost:5000/api/usage/customer \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "datasets": 5,
  "dashboards": 3,
  "charts": 12,
  "users": 4
}
```

### Get Quotas
```bash
curl -X GET http://localhost:5000/api/usage/quotas \
  -b cookies.txt
```

## 2. DATASET APIs WITH MOCK DATA

### Upload Sales Dataset
```bash
curl -X POST http://localhost:5000/api/datasets \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Q1 2024 Sales Data",
    "type": "csv",
    "data": [
      {"date": "2024-01-01", "product": "Laptop", "category": "Electronics", "revenue": 1200, "units_sold": 3, "region": "North"},
      {"date": "2024-01-02", "product": "Mouse", "category": "Electronics", "revenue": 25, "units_sold": 5, "region": "South"},
      {"date": "2024-01-03", "product": "Desk", "category": "Furniture", "revenue": 450, "units_sold": 1, "region": "East"},
      {"date": "2024-01-04", "product": "Chair", "category": "Furniture", "revenue": 300, "units_sold": 2, "region": "West"},
      {"date": "2024-01-05", "product": "Monitor", "category": "Electronics", "revenue": 400, "units_sold": 2, "region": "North"}
    ]
  }'
```

### Upload Marketing Dataset
```bash
curl -X POST http://localhost:5000/api/datasets \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Marketing Campaign Data",
    "type": "csv",
    "data": [
      {"campaign": "Summer Sale", "channel": "Email", "impressions": 10000, "clicks": 850, "conversions": 120, "cost": 500},
      {"campaign": "Winter Promo", "channel": "Social", "impressions": 25000, "clicks": 1200, "conversions": 200, "cost": 800},
      {"campaign": "Spring Launch", "channel": "PPC", "impressions": 15000, "clicks": 950, "conversions": 150, "cost": 1200}
    ]
  }'
```

## 3. ANALYTICS APIs

### Trend Analysis
```bash
# Replace DATASET_ID with actual ID from upload response
curl -X POST http://localhost:5000/api/analytics/trend \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "datasetId": "DATASET_ID",
    "xField": "date",
    "yField": "revenue"
  }'
```

### Anomaly Detection
```bash
curl -X POST http://localhost:5000/api/analytics/anomalies \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "datasetId": "DATASET_ID",
    "field": "revenue",
    "sensitivity": 2
  }'
```

### Seasonality Analysis
```bash
curl -X POST http://localhost:5000/api/analytics/seasonality \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "datasetId": "DATASET_ID",
    "dateField": "date",
    "valueField": "revenue"
  }'
```

## 4. ADVANCED CHART BUILDER

### Process Data with Filters
```bash
curl -X POST http://localhost:5000/api/charts/process-data \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "datasetId": "DATASET_ID",
    "filters": [
      {
        "field": "category",
        "operator": "equals",
        "value": "Electronics"
      }
    ],
    "aggregation": {
      "field": "revenue",
      "type": "sum",
      "groupBy": ["product"]
    }
  }'
```

## 5. AI & INSIGHTS

### Generate AI Insights
```bash
curl -X POST http://localhost:5000/api/insights/generate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "datasetId": "DATASET_ID",
    "type": "summary"
  }'
```

### AI Chat Query
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "message": "What are the top performing products by revenue?",
    "datasetId": "DATASET_ID"
  }'
```

### Check AI Status
```bash
curl -X GET http://localhost:5000/api/ai/status \
  -b cookies.txt
```

## 6. DASHBOARD & CHARTS

### Create Dashboard
```bash
curl -X POST http://localhost:5000/api/dashboards \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Sales Performance Dashboard",
    "description": "Q1 2024 sales metrics and trends"
  }'
```

### Create Chart
```bash
# Replace DASHBOARD_ID with actual ID
curl -X POST http://localhost:5000/api/charts \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "dashboardId": "DASHBOARD_ID",
    "name": "Revenue by Product",
    "type": "bar",
    "datasetId": "DATASET_ID",
    "config": {
      "xField": "product",
      "yField": "revenue"
    }
  }'
```

## 7. DATA SOURCES

### Test REST API Connection
```bash
curl -X POST http://localhost:5000/api/data-sources/test-connection \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "type": "rest_api",
    "connectionConfig": {
      "url": "https://jsonplaceholder.typicode.com/users",
      "method": "GET",
      "headers": {}
    }
  }'
```

## Performance Benchmarks

| Endpoint | Expected Response Time | Status |
|----------|----------------------|--------|
| `/api/usage/stats` | < 200ms | ✅ |
| `/api/usage/customer` | < 150ms | ✅ |
| `/api/datasets` (upload) | < 500ms | ✅ |
| `/api/analytics/trend` | < 300ms | ✅ |
| `/api/insights/generate` | < 5000ms | ✅ |
| `/api/charts/process-data` | < 250ms | ✅ |

## Load Testing Script

```bash
# Test 100 concurrent requests to usage stats
for i in {1..100}; do
  curl -X GET "http://localhost:5000/api/usage/stats?period=week" \
    -b cookies.txt &
done
wait
```
