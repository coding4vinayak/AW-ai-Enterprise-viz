
# API Endpoint Testing Script

## Using cURL to Test Endpoints

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User"
  }' \
  -c cookies.txt
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "SecurePass123!"
  }' \
  -c cookies.txt
```

### 3. Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt
```

### 4. Upload Dataset
```bash
curl -X POST http://localhost:5000/api/datasets \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Test Dataset",
    "type": "csv",
    "data": [
      {"date": "2024-01-01", "revenue": 1000, "region": "North"},
      {"date": "2024-01-02", "revenue": 1200, "region": "South"}
    ]
  }'
```

### 5. List Datasets
```bash
curl -X GET http://localhost:5000/api/datasets \
  -b cookies.txt
```

### 6. Create Dashboard
```bash
curl -X POST http://localhost:5000/api/dashboards \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Test Dashboard",
    "description": "Testing dashboard creation"
  }'
```

### 7. Get LLM Providers
```bash
curl -X GET http://localhost:5000/api/llm-providers \
  -b cookies.txt
```

### 8. Get AI Configuration
```bash
curl -X GET http://localhost:5000/api/ai-config \
  -b cookies.txt
```

### 9. Get Usage Stats
```bash
curl -X GET "http://localhost:5000/api/usage/stats?period=week" \
  -b cookies.txt
```

### 10. Test Analytics - Trend Analysis
```bash
curl -X POST http://localhost:5000/api/analytics/trend \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "datasetId": "YOUR_DATASET_ID",
    "xField": "date",
    "yField": "revenue"
  }'
```

### 11. Test Data Source Connection
```bash
curl -X POST http://localhost:5000/api/data-sources/test-connection \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "type": "rest_api",
    "connectionConfig": {
      "url": "https://api.example.com/data",
      "method": "GET",
      "headers": {}
    }
  }'
```

### 12. Generate AI Insight
```bash
curl -X POST http://localhost:5000/api/insights/generate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "datasetId": "YOUR_DATASET_ID",
    "type": "summary"
  }'
```

## JavaScript Fetch Examples

### Login and Store Token
```javascript
const login = async () => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      identifier: 'test@example.com',
      password: 'SecurePass123!'
    })
  });
  return response.json();
};
```

### Upload Dataset
```javascript
const uploadDataset = async (data) => {
  const response = await fetch('/api/datasets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      name: 'My Dataset',
      type: 'csv',
      data: data
    })
  });
  return response.json();
};
```

### Get Analytics
```javascript
const getTrend = async (datasetId) => {
  const response = await fetch('/api/analytics/trend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      datasetId: datasetId,
      xField: 'date',
      yField: 'revenue'
    })
  });
  return response.json();
};
```

## Common HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **304 Not Modified** - Cached resource still valid
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error
