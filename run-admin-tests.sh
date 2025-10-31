
#!/bin/bash

echo "🧪 Running Admin & Sidebar Comprehensive Test Suite"
echo "=================================================="

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Run tests
echo ""
echo "🏃 Running all tests..."
npm run test -- --run

echo ""
echo "📊 Generating coverage report..."
npm run test -- --coverage --run

echo ""
echo "✅ Test suite complete!"
