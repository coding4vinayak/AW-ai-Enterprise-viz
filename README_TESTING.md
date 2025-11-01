# Complete Admin Panel Testing Suite

## Overview

This project includes a comprehensive testing suite for the entire admin panel with proper access control and role-based testing.

## Quick Start

### 1. Install Testing Dependencies

Run the installation script:

```bash
./install-test-deps.sh
```

Or install manually:

```bash
npm install --save-dev \
  @testing-library/react@14.3.1 \
  @testing-library/jest-dom@6.5.0 \
  @testing-library/user-event@14.5.2 \
  jsdom@25.0.1 \
  --legacy-peer-deps
```

### 2. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run only admin tests
npm test -- admin
```

## Test Files

### Frontend Tests
- `client/src/test/admin.test.tsx` - Comprehensive React component tests for admin panel

### Backend Tests  
- `server/test/admin-routes.test.ts` - API integration tests for admin routes

### Test Setup
- `client/src/test/setup.ts` - Test environment configuration
- `vitest.config.ts` - Vitest configuration

## Test Coverage

### Admin Panel Features Tested

#### ✅ Access Control
- Super admin can access all features
- Customer admin can access their customer's data
- Analysts and viewers are denied access
- Role-based permissions enforced

#### ✅ Customer Management  
- View all customers (super_admin only)
- Create new customers
- Update customer status (active/inactive/suspended)
- Display customer statistics
- Handle validation errors
- Handle duplicate slugs

#### ✅ User Management
- View all users (super_admin) or customer users (customer_admin)
- Create new users
- Update user status
- Prevent duplicate emails
- Role validation
- Customer assignment

#### ✅ AI Providers
- View available AI providers
- Check provider status
- View default models
- Configuration instructions

#### ✅ Overview Dashboard
- Total customers count
- Active customers count
- Total users count
- Active users count
- AI providers count
- System status
- Recent customers list
- Recent users list

#### ✅ Tab Navigation
- Switch between Overview, Customers, Users, AI Providers
- Maintain state during navigation
- Handle data refresh

#### ✅ Error Handling
- Network errors
- API errors
- Validation errors
- Duplicate data errors
- Loading states
- Empty states

## Running Specific Test Suites

### Frontend Only
```bash
npm test -- client/src/test/admin.test.tsx
```

### Backend Only
```bash
npm test -- server/test/admin-routes.test.ts
```

### Watch Mode for Development
```bash
npm test -- --watch admin
```

## Test Data

### Mock Users

**Super Admin**
- Email: admin@test.com
- Role: super_admin  
- Access: Full admin panel

**Customer Admin**
- Email: customer-admin@test.com
- Role: customer_admin
- Access: User management for customer-1 only

**Analyst**
- Email: analyst@test.com
- Role: analyst
- Access: Denied

**Viewer**
- Email: viewer@test.com
- Role: viewer
- Access: Denied

### Mock Data

**Customers**
- Customer 1: active, slug: test-customer-1
- Customer 2: inactive, slug: test-customer-2

**Users**
- User 1: viewer, active, customer-1
- User 2: analyst, inactive, customer-2

**AI Providers**
- OpenAI: active, model: gpt-4
- Anthropic: inactive, model: claude-3

## Coverage Report

After running `npm run test:coverage`, view the coverage report:

```bash
# View in browser
open coverage/index.html

# Or check terminal output
```

### Coverage Goals
- Overall: 80%+
- Admin Routes: 90%+
- Admin Components: 85%+
- Critical Paths: 100%

## Debugging Tests

### Enable Verbose Output
```bash
npm test -- --reporter=verbose
```

### Run Single Test
```bash
npm test -- -t "should create new customer"
```

### Debug in VS Code
Add this to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["test", "--", "--run"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm install
      - run: ./install-test-deps.sh
      - run: npm test -- --coverage
      
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
```

## Troubleshooting

### Tests Not Running

1. **Check dependencies installed:**
   ```bash
   npm list @testing-library/react
   ```

2. **Clear cache:**
   ```bash
   rm -rf node_modules/.vite
   npm test
   ```

3. **Check Node version:**
   ```bash
   node --version  # Should be 18+ or 20+
   ```

### Test Failures

1. **Check logs:**
   ```bash
   npm test -- --reporter=verbose
   ```

2. **Run single failing test:**
   ```bash
   npm test -- -t "test name"
   ```

3. **Check for LSP errors:**
   - TypeScript errors in test files
   - Missing imports
   - Incorrect types

### Performance Issues

1. **Run tests in parallel:**
   ```bash
   npm test -- --pool=threads --poolOptions.threads.maxThreads=4
   ```

2. **Skip coverage for faster runs:**
   ```bash
   npm test
   ```

## Best Practices

1. **Write Descriptive Test Names**
   ```typescript
   it('should deny access for viewer role')
   it('should create new customer successfully')
   ```

2. **Use data-testid Attributes**
   ```tsx
   <Button data-testid="button-add-customer">Add Customer</Button>
   ```

3. **Mock External Dependencies**
   ```typescript
   vi.mock('@/lib/auth-context')
   ```

4. **Test Error Scenarios**
   ```typescript
   it('should handle customer creation error')
   ```

5. **Keep Tests Independent**
   - Each test should clean up after itself
   - Don't depend on test execution order
   - Use beforeEach/afterEach for setup/cleanup

## Documentation

- [TESTING_ADMIN.md](./TESTING_ADMIN.md) - Detailed testing guide
- [vitest.config.ts](./vitest.config.ts) - Vitest configuration
- [client/src/test/setup.ts](./client/src/test/setup.ts) - Test setup

## Support

If you encounter issues:

1. Check this README
2. Check TESTING_ADMIN.md
3. Review test file comments  
4. Check Vitest documentation: https://vitest.dev
5. Check Testing Library docs: https://testing-library.com

## Next Steps

1. Install dependencies: `./install-test-deps.sh`
2. Run tests: `npm test`
3. Check coverage: `npm run test:coverage`
4. Set up CI/CD with automated testing
5. Add E2E tests with Playwright (future enhancement)
