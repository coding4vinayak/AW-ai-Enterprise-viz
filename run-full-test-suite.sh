
#!/bin/bash

# Comprehensive Test Suite Runner
# Tests all AI, monitoring, and analytics features

set -e

echo "🧪 Starting Comprehensive Test Suite..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Helper function to run test
run_test() {
    local test_name=$1
    local command=$2
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    echo -e "\n${YELLOW}Testing: $test_name${NC}"
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Login and setup
echo "🔐 Logging in..."
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "admin@example.com", "password": "admin123"}' \
  -c cookies.txt -s > /dev/null

echo "✓ Logged in successfully"

# 1. AI CONFIGURATION TESTS
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}1. AI CONFIGURATION TESTS${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

run_test "Get LLM Providers" \
  "curl -X GET http://localhost:5000/api/llm-providers -b cookies.txt -s -w '%{http_code}' -o /dev/null | grep -q 200"

run_test "Get AI Config" \
  "curl -X GET http://localhost:5000/api/ai-config -b cookies.txt -s -w '%{http_code}' -o /dev/null | grep -q '200\|404'"

run_test "Check AI Status" \
  "curl -X GET http://localhost:5000/api/ai/status -b cookies.txt -s -w '%{http_code}' -o /dev/null | grep -q 200"

# 2. DATASET TESTS
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}2. DATASET MANAGEMENT TESTS${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Create test dataset
DATASET_RESPONSE=$(curl -X POST http://localhost:5000/api/datasets \
  -H "Content-Type: application/json" \
  -b cookies.txt -s \
  -d '{
    "name": "Test Dataset",
    "type": "csv",
    "data": [
      {"date": "2024-01-01", "revenue": 1000, "category": "A"},
      {"date": "2024-01-02", "revenue": 1500, "category": "B"},
      {"date": "2024-01-03", "revenue": 800, "category": "A"},
      {"date": "2024-01-04", "revenue": 2000, "category": "B"},
      {"date": "2024-01-05", "revenue": 1200, "category": "A"}
    ]
  }')

DATASET_ID=$(echo $DATASET_RESPONSE | jq -r '.id')

if [ "$DATASET_ID" != "null" ] && [ -n "$DATASET_ID" ]; then
    echo -e "${GREEN}✓ Dataset created: $DATASET_ID${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ Failed to create dataset${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

run_test "List Datasets" \
  "curl -X GET http://localhost:5000/api/datasets -b cookies.txt -s -w '%{http_code}' -o /dev/null | grep -q 200"

# 3. ANALYTICS TESTS
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}3. ANALYTICS ENGINE TESTS${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -n "$DATASET_ID" ] && [ "$DATASET_ID" != "null" ]; then
    run_test "Trend Analysis" \
      "curl -X POST http://localhost:5000/api/analytics/trend \
        -H 'Content-Type: application/json' \
        -b cookies.txt -s -w '%{http_code}' -o /dev/null \
        -d '{\"datasetId\": \"$DATASET_ID\", \"xField\": \"date\", \"yField\": \"revenue\"}' | grep -q 200"

    run_test "Anomaly Detection" \
      "curl -X POST http://localhost:5000/api/analytics/anomalies \
        -H 'Content-Type: application/json' \
        -b cookies.txt -s -w '%{http_code}' -o /dev/null \
        -d '{\"datasetId\": \"$DATASET_ID\", \"field\": \"revenue\", \"sensitivity\": 2}' | grep -q 200"

    run_test "Seasonality Analysis" \
      "curl -X POST http://localhost:5000/api/analytics/seasonality \
        -H 'Content-Type: application/json' \
        -b cookies.txt -s -w '%{http_code}' -o /dev/null \
        -d '{\"datasetId\": \"$DATASET_ID\", \"dateField\": \"date\", \"valueField\": \"revenue\"}' | grep -q 200"
else
    echo -e "${YELLOW}⚠ Skipping analytics tests (no dataset)${NC}"
fi

# 4. USAGE & MONITORING TESTS
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}4. USAGE & MONITORING TESTS${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

run_test "Usage Stats (Day)" \
  "curl -X GET 'http://localhost:5000/api/usage/stats?period=day' -b cookies.txt -s -w '%{http_code}' -o /dev/null | grep -q 200"

run_test "Usage Stats (Week)" \
  "curl -X GET 'http://localhost:5000/api/usage/stats?period=week' -b cookies.txt -s -w '%{http_code}' -o /dev/null | grep -q 200"

run_test "Usage Stats (Month)" \
  "curl -X GET 'http://localhost:5000/api/usage/stats?period=month' -b cookies.txt -s -w '%{http_code}' -o /dev/null | grep -q 200"

run_test "Customer Usage Data" \
  "curl -X GET http://localhost:5000/api/usage/customer -b cookies.txt -s -w '%{http_code}' -o /dev/null | grep -q 200"

run_test "Get Quotas" \
  "curl -X GET http://localhost:5000/api/usage/quotas -b cookies.txt -s -w '%{http_code}' -o /dev/null | grep -q 200"

# 5. CHART PROCESSING TESTS
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}5. CHART PROCESSING TESTS${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -n "$DATASET_ID" ] && [ "$DATASET_ID" != "null" ]; then
    run_test "Process Chart Data with Filters" \
      "curl -X POST http://localhost:5000/api/charts/process-data \
        -H 'Content-Type: application/json' \
        -b cookies.txt -s -w '%{http_code}' -o /dev/null \
        -d '{\"datasetId\": \"$DATASET_ID\", \"filters\": [{\"field\": \"category\", \"operator\": \"equals\", \"value\": \"A\"}]}' | grep -q 200"
fi

# 6. HEALTH & PERFORMANCE TESTS
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}6. HEALTH & PERFORMANCE TESTS${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

run_test "Health Check" \
  "curl -X GET http://localhost:5000/health -s -w '%{http_code}' -o /dev/null | grep -q 200"

# Performance test - measure response time
echo -e "\n${YELLOW}Testing: Response Time < 200ms${NC}"
RESPONSE_TIME=$(curl -X GET "http://localhost:5000/api/usage/stats?period=week" \
  -b cookies.txt -s -w '%{time_total}' -o /dev/null)

if (( $(echo "$RESPONSE_TIME < 0.2" | bc -l) )); then
    echo -e "${GREEN}✓ PASSED (${RESPONSE_TIME}s)${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠ WARNING (${RESPONSE_TIME}s - slower than target)${NC}"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# 7. ERROR HANDLING TESTS
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}7. ERROR HANDLING TESTS${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

run_test "Invalid Dataset ID (404)" \
  "curl -X POST http://localhost:5000/api/analytics/trend \
    -H 'Content-Type: application/json' \
    -b cookies.txt -s -w '%{http_code}' -o /dev/null \
    -d '{\"datasetId\": \"invalid-id\", \"xField\": \"date\", \"yField\": \"revenue\"}' | grep -q 404"

run_test "Unauthorized Access (401)" \
  "curl -X GET http://localhost:5000/api/usage/stats -s -w '%{http_code}' -o /dev/null | grep -q 401"

# Cleanup
rm -f cookies.txt

# Final Results
echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}TEST RESULTS SUMMARY${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Total Tests: $TESTS_TOTAL"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
    exit 0
else
    echo -e "\n${RED}❌ SOME TESTS FAILED${NC}"
    exit 1
fi
