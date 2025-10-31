
# Comprehensive Test Suite - AI, Monitoring & Analytics

## Test Execution Date: 2024-01-01
## Environment: Development

---

## 1. AI FEATURES TESTING

### 1.1 AI Configuration Tests

#### Test OpenAI Provider Configuration
```bash
# Login first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "admin@example.com", "password": "admin123"}' \
  -c cookies.txt

# Get available providers
curl -X GET http://localhost:5000/api/llm-providers \
  -b cookies.txt

# Configure OpenAI
curl -X POST http://localhost:5000/api/ai-config \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "providerId": "PROVIDER_ID_FROM_ABOVE",
    "apiKey": "sk-YOUR_OPENAI_KEY",
    "model": "gpt-4",
    "settings": {
      "temperature": 0.7,
      "maxTokens": 1000
    },
    "isDefault": true
  }'

# Test connection
curl -X POST http://localhost:5000/api/ai-config/test \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "providerId": "PROVIDER_ID",
    "apiKey": "sk-YOUR_KEY",
    "model": "gpt-4"
  }'

# Get current config
curl -X GET http://localhost:5000/api/ai-config \
  -b cookies.txt
```

### 1.2 AI Insights Generation Tests

```bash
# Upload test dataset first
DATASET_ID=$(curl -X POST http://localhost:5000/api/datasets \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Sales Test Data",
    "type": "csv",
    "data": [
      {"date": "2024-01-01", "revenue": 1000, "category": "A"},
      {"date": "2024-01-02", "revenue": 1500, "category": "B"},
      {"date": "2024-01-03", "revenue": 800, "category": "A"},
      {"date": "2024-01-04", "revenue": 2000, "category": "B"}
    ]
  }' | jq -r '.id')

# Generate AI insight - Summary
curl -X POST http://localhost:5000/api/insights/generate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{\"datasetId\": \"$DATASET_ID\", \"type\": \"summary\"}"

# Generate AI insight - Trend
curl -X POST http://localhost:5000/api/insights/generate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{\"datasetId\": \"$DATASET_ID\", \"type\": \"trend\"}"

# Get all insights
curl -X GET http://localhost:5000/api/insights \
  -b cookies.txt

# Get insights for specific dataset
curl -X GET "http://localhost:5000/api/insights?datasetId=$DATASET_ID" \
  -b cookies.txt
```

### 1.3 AI Chat Tests

```bash
# Test chat without context
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "messages": [
      {"role": "user", "content": "What are best practices for data visualization?"}
    ]
  }'

# Test chat with dataset context
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{
    \"messages\": [
      {\"role\": \"user\", \"content\": \"Analyze the revenue trends in this dataset\"}
    ],
    \"datasetId\": \"$DATASET_ID\"
  }"

# Check AI status
curl -X GET http://localhost:5000/api/ai/status \
  -b cookies.txt
```

---

## 2. ANALYTICS & MONITORING TESTS

### 2.1 Trend Analysis

```bash
# Analyze trend
curl -X POST http://localhost:5000/api/analytics/trend \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{
    \"datasetId\": \"$DATASET_ID\",
    \"xField\": \"date\",
    \"yField\": \"revenue\"
  }"
```

### 2.2 Anomaly Detection

```bash
# Detect anomalies
curl -X POST http://localhost:5000/api/analytics/anomalies \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{
    \"datasetId\": \"$DATASET_ID\",
    \"field\": \"revenue\",
    \"sensitivity\": 2
  }"
```

### 2.3 Seasonality Detection

```bash
# Detect seasonality
curl -X POST http://localhost:5000/api/analytics/seasonality \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{
    \"datasetId\": \"$DATASET_ID\",
    \"dateField\": \"date\",
    \"valueField\": \"revenue\"
  }"
```

---

## 3. USAGE & MONITORING TESTS

### 3.1 Usage Statistics

```bash
# Get usage stats - day
curl -X GET "http://localhost:5000/api/usage/stats?period=day" \
  -b cookies.txt

# Get usage stats - week
curl -X GET "http://localhost:5000/api/usage/stats?period=week" \
  -b cookies.txt

# Get usage stats - month
curl -X GET "http://localhost:5000/api/usage/stats?period=month" \
  -b cookies.txt
```

### 3.2 Customer Usage Data

```bash
# Get customer resource counts
curl -X GET http://localhost:5000/api/usage/customer \
  -b cookies.txt
```

### 3.3 Quota Information

```bash
# Get quotas
curl -X GET http://localhost:5000/api/usage/quotas \
  -b cookies.txt
```

---

## 4. ADVANCED CHART BUILDER TESTS

### 4.1 Data Processing with Filters

```bash
# Process data with filters
curl -X POST http://localhost:5000/api/charts/process-data \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{
    \"datasetId\": \"$DATASET_ID\",
    \"filters\": [
      {
        \"field\": \"category\",
        \"operator\": \"equals\",
        \"value\": \"A\"
      }
    ],
    \"aggregation\": {
      \"field\": \"revenue\",
      \"type\": \"sum\",
      \"groupBy\": [\"category\"]
    }
  }"
```

### 4.2 Calculated Fields

```bash
# Apply calculated fields
curl -X POST "http://localhost:5000/api/datasets/$DATASET_ID/calculated-fields" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "fields": [
      {
        "name": "revenue_per_unit",
        "formula": "revenue / units_sold",
        "type": "number"
      }
    ]
  }'
```

---

## 5. LOAD & PERFORMANCE TESTS

### 5.1 Concurrent Request Test

```bash
# Test 50 concurrent requests to usage stats
for i in {1..50}; do
  curl -X GET "http://localhost:5000/api/usage/stats?period=week" \
    -b cookies.txt &
done
wait

echo "Load test completed"
```

### 5.2 Large Dataset Upload Test

```bash
# Generate large dataset (1000 rows)
python3 << 'EOF'
import json
import random
from datetime import datetime, timedelta

data = []
start_date = datetime(2024, 1, 1)

for i in range(1000):
    data.append({
        "date": (start_date + timedelta(days=i % 365)).isoformat(),
        "revenue": random.randint(500, 5000),
        "category": random.choice(["A", "B", "C", "D"]),
        "region": random.choice(["North", "South", "East", "West"])
    })

print(json.dumps({"name": "Large Dataset", "type": "csv", "data": data}))
EOF
```

---

## 6. ERROR HANDLING TESTS

### 6.1 Invalid Input Tests

```bash
# Test with invalid dataset ID
curl -X POST http://localhost:5000/api/analytics/trend \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "datasetId": "invalid-id",
    "xField": "date",
    "yField": "revenue"
  }'

# Test with missing fields
curl -X POST http://localhost:5000/api/insights/generate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{}'

# Test unauthorized access (no cookie)
curl -X GET http://localhost:5000/api/usage/stats
```

---

## 7. HEALTH CHECK & MONITORING

```bash
# Check application health
curl -X GET http://localhost:5000/health

# Check database metrics
curl -X GET http://localhost:5000/metrics/db \
  -b cookies.txt
```

---

## Expected Results Checklist

### AI Features
- [ ] LLM providers list retrieved
- [ ] AI configuration saved successfully
- [ ] Connection test passed
- [ ] Insights generated (summary, trend, anomaly, forecast)
- [ ] Chat responses received
- [ ] AI status shows configured

### Analytics
- [ ] Trend analysis returns slope, predictions
- [ ] Anomaly detection identifies outliers
- [ ] Seasonality detection finds patterns

### Monitoring
- [ ] Usage stats show API calls, tokens, storage
- [ ] Customer data shows resource counts
- [ ] Quotas retrieved successfully

### Performance
- [ ] Concurrent requests handled (no errors)
- [ ] Large datasets processed (<2s)
- [ ] Response times under targets

### Error Handling
- [ ] 404 for invalid dataset IDs
- [ ] 400 for missing required fields
- [ ] 401 for unauthorized requests

---

## Performance Targets

| Operation | Target | Status |
|-----------|--------|--------|
| Usage Stats API | <200ms | ⏱️ |
| AI Insight Generation | <5s | ⏱️ |
| Trend Analysis | <300ms | ⏱️ |
| Anomaly Detection | <400ms | ⏱️ |
| Chat Response | <3s | ⏱️ |
| Dataset Upload (1000 rows) | <1s | ⏱️ |

---

## Monitoring Metrics to Track

1. **API Metrics**
   - Total requests/minute
   - Error rate
   - Average response time
   - P95/P99 latency

2. **AI Metrics**
   - Token usage per request
   - AI provider errors
   - Insight generation success rate

3. **Resource Metrics**
   - Memory usage
   - CPU utilization
   - Database connections

4. **Business Metrics**
   - Active users
   - Datasets created
   - Dashboards created
   - AI features usage

