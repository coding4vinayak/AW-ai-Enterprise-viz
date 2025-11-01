#!/bin/bash

# Script to install testing dependencies for Admin Panel tests
# This uses --legacy-peer-deps to resolve version conflicts

echo "Installing testing dependencies..."

npm install --save-dev \
  @testing-library/react@14.3.1 \
  @testing-library/jest-dom@6.5.0 \
  @testing-library/user-event@14.5.2 \
  jsdom@25.0.1 \
  supertest@7.1.4 \
  @types/supertest@6.0.2 \
  --legacy-peer-deps

echo ""
echo "✅ Testing dependencies installed successfully!"
echo ""
echo "Available test commands:"
echo "  npm test                    - Run all tests"
echo "  npm test -- --watch         - Run tests in watch mode"
echo "  npm run test:ui             - Run tests with UI"
echo "  npm run test:coverage       - Run tests with coverage"
echo ""
echo "Run specific tests:"
echo "  npm test -- admin           - Run only admin tests"
echo "  npm test -- admin-routes    - Run only backend tests"
