
# Testing Guide

## Testing Strategy

This application uses a multi-layered testing approach:

1. **Unit Tests** - Individual functions and components
2. **Integration Tests** - API endpoints and database operations
3. **End-to-End Tests** - Full user workflows
4. **Manual Testing** - UI/UX validation

## Test Setup

### Install Testing Dependencies

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest @vitest/ui
```

### Configure Vitest

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './client/src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
});
```

## Unit Tests

### Testing Components

```typescript
// client/src/components/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../ui/button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Testing Utilities

```typescript
// server/__tests__/auth.test.ts
import { hashPassword, verifyPassword } from '../middleware/auth';

describe('Authentication', () => {
  it('hashes passwords correctly', async () => {
    const password = 'testPassword123';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50);
  });

  it('verifies passwords correctly', async () => {
    const password = 'testPassword123';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });
});
```

## Integration Tests

### API Endpoint Testing

```typescript
// server/__tests__/routes.test.ts
import request from 'supertest';
import { app } from '../index';

describe('Authentication API', () => {
  it('POST /api/auth/register creates user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe('test@example.com');
  });

  it('POST /api/auth/login authenticates user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'testuser',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.user).toHaveProperty('id');
  });
});

describe('Datasets API', () => {
  let authCookie: string;

  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'testuser', password: 'password123' });
    authCookie = response.headers['set-cookie'];
  });

  it('POST /api/datasets creates dataset', async () => {
    const response = await request(app)
      .post('/api/datasets')
      .set('Cookie', authCookie)
      .send({
        name: 'Test Dataset',
        type: 'csv',
        data: [{ col1: 'value1', col2: 100 }],
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Test Dataset');
  });
});
```

## End-to-End Tests

### Using Playwright

```bash
npm install --save-dev @playwright/test
```

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('user can register and login', async ({ page }) => {
    await page.goto('http://localhost:5000');

    // Register
    await page.click('text=Register');
    await page.fill('[name="email"]', 'e2e@example.com');
    await page.fill('[name="username"]', 'e2euser');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('user can upload dataset', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5000/login');
    await page.fill('[name="identifier"]', 'e2euser');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to data sources
    await page.click('text=Data Sources');

    // Upload file
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-data.csv');

    // Verify upload
    await expect(page.locator('text=Test Dataset')).toBeVisible();
  });
});
```

## Manual Testing Checklist

### Authentication
- [ ] User registration with valid data
- [ ] Registration with duplicate email/username (should fail)
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials (should fail)
- [ ] Session persistence after page reload
- [ ] Logout functionality

### Data Management
- [ ] Upload CSV file
- [ ] Upload Excel file
- [ ] View dataset list
- [ ] Delete dataset
- [ ] Dataset preview shows correct data

### Dashboards
- [ ] Create new dashboard
- [ ] Add charts to dashboard
- [ ] Edit dashboard name/description
- [ ] Delete dashboard
- [ ] Dashboard grid layout works

### Charts
- [ ] Create line chart
- [ ] Create bar chart
- [ ] Create pie chart
- [ ] Chart updates with data changes
- [ ] Export chart data

### AI Features
- [ ] Generate insights from dataset
- [ ] Chat with AI about data
- [ ] AI responses are relevant
- [ ] Graceful handling when AI not configured

### Admin Features
- [ ] Super admin can view all customers
- [ ] Customer admin can manage users
- [ ] Role-based access control works
- [ ] Usage statistics display correctly

## Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Test Coverage Goals

- Unit Tests: >80% coverage
- Integration Tests: All API endpoints
- E2E Tests: Critical user paths

## Continuous Integration

Tests run automatically on:
- Every commit to main branch
- All pull requests
- Pre-deployment checks

## Test Data

Test data is located in:
- `server/test-data/` - Sample CSV/Excel files
- `server/__tests__/fixtures/` - Mock data objects

## Performance Testing

Use Apache Bench or Artillery for load testing:

```bash
# Test API endpoint
ab -n 1000 -c 10 http://localhost:5000/api/datasets

# Artillery test
artillery quick --count 100 --num 10 http://localhost:5000/api/datasets
```

## Security Testing

- SQL injection tests
- XSS vulnerability tests
- CSRF protection tests
- Authentication bypass attempts
