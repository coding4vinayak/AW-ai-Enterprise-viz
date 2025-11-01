#!/bin/bash

# Script to install testing dependencies for Admin Panel tests
# This uses --legacy-peer-deps to resolve version conflicts

echo "Installing testing dependencies..."

npm install --save-dev \
  @testing-library/react@14.3.1 \
  @testing-library/jest-dom@6.5.0 \
  @testing-library/user-event@14.5.2 \
  jsdom@25.0.1 \
  --legacy-peer-deps

echo "Testing dependencies installed successfully!"
echo ""
echo "Run tests with: npm test"
echo "Run tests with UI: npm run test:ui"
echo "Run tests with coverage: npm run test:coverage"
