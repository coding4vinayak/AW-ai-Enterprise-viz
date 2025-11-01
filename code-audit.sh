
#!/bin/bash

echo "🔍 Running Comprehensive Code Audit"
echo "===================================="
echo ""

# Check for console.log statements
echo "📝 Checking for console.log statements in production code..."
grep -r "console.log" --include="*.ts" --include="*.tsx" client/src server | grep -v "node_modules" | grep -v ".test." || echo "✓ No console.log found"
echo ""

# Check for any type usage
echo "🔍 Checking for 'any' type usage..."
grep -r ": any" --include="*.ts" --include="*.tsx" client/src server | grep -v "node_modules" | grep -v ".test." || echo "✓ No any types found"
echo ""

# Check for TODO/FIXME comments
echo "📋 Checking for TODO/FIXME comments..."
grep -r "TODO\|FIXME" --include="*.ts" --include="*.tsx" client/src server | grep -v "node_modules" || echo "✓ No TODOs found"
echo ""

# Run npm audit
echo "🔒 Running npm audit..."
npm audit
echo ""

# Check for unused dependencies
echo "📦 Checking for unused dependencies..."
npx depcheck --ignores="@types/*,vite,typescript,tsx" || echo "⚠️ Install depcheck: npm i -g depcheck"
echo ""

# Run TypeScript compiler check
echo "📘 Running TypeScript type checking..."
npx tsc --noEmit
echo ""

# Check for large files
echo "📊 Checking for large files (>500KB)..."
find . -type f -size +500k -not -path "*/node_modules/*" -not -path "*/.git/*" | head -20
echo ""

# Check for missing error handling
echo "⚠️ Checking for potential unhandled promises..."
grep -r "async.*=>" --include="*.ts" --include="*.tsx" server | grep -v "try\|catch" | grep -v "node_modules" | head -10 || echo "✓ Most async functions have error handling"
echo ""

echo "✅ Code Audit Complete"
echo ""
echo "Next steps:"
echo "1. Review ERROR_REPORT.md"
echo "2. Run: npm test -- --coverage"
echo "3. Run: npm audit fix"
echo "4. Address critical security issues first"
