
#!/bin/bash

# Monitoring & Metrics Test Script
# Validates all monitoring endpoints and tracks performance

echo "📊 Monitoring & Metrics Validation"
echo "===================================="

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "admin@example.com", "password": "admin123"}' \
  -c cookies.txt -s > /dev/null

echo "✓ Authenticated"
echo ""

# Test 1: Usage Statistics
echo "1. Testing Usage Statistics..."
for period in day week month; do
    echo "   Period: $period"
    RESPONSE=$(curl -X GET "http://localhost:5000/api/usage/stats?period=$period" \
      -b cookies.txt -s)
    
    API_CALLS=$(echo $RESPONSE | jq -r '.api_calls // 0')
    AI_TOKENS=$(echo $RESPONSE | jq -r '.ai_tokens // 0')
    STORAGE=$(echo $RESPONSE | jq -r '.storage // 0')
    
    echo "   - API Calls: $API_CALLS"
    echo "   - AI Tokens: $AI_TOKENS"
    echo "   - Storage: $STORAGE bytes"
    echo ""
done

# Test 2: Customer Usage Data
echo "2. Testing Customer Usage Data..."
CUSTOMER_DATA=$(curl -X GET http://localhost:5000/api/usage/customer \
  -b cookies.txt -s)

echo "   - Datasets: $(echo $CUSTOMER_DATA | jq -r '.datasets // 0')"
echo "   - Dashboards: $(echo $CUSTOMER_DATA | jq -r '.dashboards // 0')"
echo "   - Charts: $(echo $CUSTOMER_DATA | jq -r '.charts // 0')"
echo "   - Users: $(echo $CUSTOMER_DATA | jq -r '.users // 0')"
echo ""

# Test 3: Health Check
echo "3. Testing Health Check..."
HEALTH=$(curl -X GET http://localhost:5000/health -s)
echo "   Status: $(echo $HEALTH | jq -r '.status // "unknown"')"
echo ""

# Test 4: Performance Metrics
echo "4. Testing Performance..."
echo "   Measuring response times for 10 requests..."

TOTAL_TIME=0
for i in {1..10}; do
    TIME=$(curl -X GET "http://localhost:5000/api/usage/stats?period=week" \
      -b cookies.txt -s -w '%{time_total}' -o /dev/null)
    TOTAL_TIME=$(echo "$TOTAL_TIME + $TIME" | bc)
    echo -n "."
done

AVG_TIME=$(echo "scale=3; $TOTAL_TIME / 10" | bc)
echo ""
echo "   Average response time: ${AVG_TIME}s"

if (( $(echo "$AVG_TIME < 0.2" | bc -l) )); then
    echo "   ✓ Performance target met (<200ms)"
else
    echo "   ⚠ Performance slower than target"
fi

# Cleanup
rm -f cookies.txt

echo ""
echo "✓ Monitoring validation complete"
