# Admin Panel Testing Guide

This document provides comprehensive testing instructions for the Admin Panel functionality.

## Prerequisites

### Required Testing Dependencies

The following packages need to be installed for frontend tests to run:

```bash
npm install --save-dev @testing-library/react@14.3.1 @testing-library/jest-dom@6.5.0 @testing-library/user-event@14.5.2 jsdom@25.0.1
```

## Test Structure

### Frontend Tests (`client/src/test/admin.test.tsx`)

Comprehensive React component tests covering:

1. **Access Control Tests**
   - Deny access for viewer role
   - Deny access for analyst role  
   - Allow access for super_admin
   - Allow access for customer_admin

2. **Overview Tab Tests**
   - Display all statistics (customers, users, providers)
   - Show recent customers
   - Show recent users
   - Handle empty states

3. **Customer Management Tests**
   - Disable customer tab for non-super-admin
   - Display customers table
   - Open create customer dialog
   - Create new customer successfully
   - Handle customer creation errors
   - Display loading states
   - Display empty states
   - Update customer status

4. **User Management Tests**
   - Display users table
   - Show "Never" for users without last login
   - Open create user dialog
   - Create new user successfully
   - Handle user creation errors
   - Display loading states
   - Display empty states
   - Update user status

5. **AI Providers Tab Tests**
   - Display AI providers table
   - Show active/inactive status
   - Display loading states
   - Display empty states
   - Show provider configuration info

6. **Tab Navigation Tests**
   - Switch between all tabs
   - Maintain tab state after data refresh

7. **Error Handling Tests**
   - Handle network errors gracefully
   - Handle API error responses

8. **Data Refresh Tests**
   - Refetch data after successful operations

### Backend Tests (`server/test/admin-routes.test.ts`)

Integration tests for admin API routes covering:

1. **Customer Management Tests**
   - Fetch all customers
   - Create new customer
   - Update customer status
   - Handle non-existent customers

2. **User Management Tests**
   - Fetch all users
   - Fetch users by customer
   - Create new user
   - Prevent duplicate email
   - Update user status
   - Delete user

3. **Access Control Tests**
   - Super admin permissions
   - Customer admin permissions

4. **Data Validation Tests**
   - Validate required customer fields
   - Validate required user fields
   - Validate status values
   - Validate role values

5. **Error Handling Tests**
   - Database errors
   - Duplicate data errors
   - Connection failures

6. **Bulk Operations Tests**
   - Multiple customer operations
   - Multiple user operations

7. **Performance Tests**
   - Large customer datasets (1000+ records)
   - Large user datasets (1000+ records)

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Only Admin Tests
```bash
npm test -- admin
```

### Run Only Backend Tests
```bash
npm test -- admin-routes
```

## Test Coverage Goals

- **Overall Coverage**: 80%+
- **Admin Routes**: 90%+
- **Admin Components**: 85%+
- **Critical Paths**: 100%

## Admin Access Testing

### Test Users

The following test users are created in the test setup:

1. **Super Admin**
   - Email: admin@test.com
   - Role: super_admin
   - Access: Full admin panel access

2. **Customer Admin**
   - Role: customer_admin
   - Access: User management for their customer only

3. **Analyst**
   - Role: analyst
   - Access: Denied (no admin panel access)

4. **Viewer**
   - Role: viewer
   - Access: Denied (no admin panel access)

### Access Control Matrix

| Role | Overview | Customers | Users | AI Providers |
|------|----------|-----------|-------|--------------|
| super_admin | ✅ | ✅ | ✅ | ✅ |
| customer_admin | ✅ | ❌ | ✅ (own only) | ✅ |
| analyst | ❌ | ❌ | ❌ | ❌ |
| viewer | ❌ | ❌ | ❌ | ❌ |

## Test Scenarios

### Customer Management Scenarios

1. **Create Customer**
   - Fill in customer name
   - Generate slug
   - Set status (active/inactive/suspended)
   - Submit form
   - Verify customer appears in table

2. **Update Customer Status**
   - Select customer from table
   - Change status via dropdown
   - Verify status updated
   - Verify data refreshed

3. **View Customer Details**
   - View customer in overview
   - Check customer count
   - Verify active customer count

### User Management Scenarios

1. **Create User**
   - Fill in email, username, password
   - Select customer (super_admin only)
   - Select role
   - Submit form
   - Verify user appears in table

2. **Update User Status**
   - Select user from table
   - Change status via dropdown  
   - Verify status updated
   - Verify data refreshed

3. **View User Details**
   - View user in overview
   - Check user count
   - Verify active user count
   - Check last login timestamp

### AI Providers Scenarios

1. **View Providers**
   - Navigate to providers tab
   - View provider list
   - Check provider status (active/inactive)
   - View default models

2. **Provider Configuration**
   - Read configuration instructions
   - Navigate to AI Settings page
   - Configure provider API keys

## Error Testing

### Expected Error Scenarios

1. **Duplicate Customer Slug**
   - Attempt to create customer with existing slug
   - Verify error message displayed
   - Verify customer not created

2. **Duplicate User Email**
   - Attempt to create user with existing email
   - Verify error message displayed
   - Verify user not created

3. **Missing Required Fields**
   - Submit form with empty required fields
   - Verify validation errors
   - Verify form not submitted

4. **Network Errors**
   - Simulate network failure
   - Verify error handling
   - Verify user-friendly error message

5. **Unauthorized Access**
   - Attempt to access admin panel as viewer
   - Verify access denied message
   - Verify redirect or block

## Continuous Integration

Tests should run automatically on:
- Every commit
- Every pull request
- Before deployment

## Debugging Failed Tests

1. **Check Test Logs**
   ```bash
   npm test -- --reporter=verbose
   ```

2. **Run Single Test**
   ```bash
   npm test -- -t "should create new customer"
   ```

3. **Check Browser Console** (for frontend tests)
   - Open test UI
   - Inspect browser console
   - Check network tab

4. **Enable Debug Mode**
   ```bash
   DEBUG=* npm test
   ```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Mock External Dependencies**: Use vi.mock() for API calls
3. **Use Test IDs**: All interactive elements have data-testid attributes
4. **Descriptive Names**: Test names clearly describe what they test
5. **Cleanup**: Always cleanup after tests
6. **Assertions**: Use specific assertions (toHaveTextContent vs toBeTruthy)

## Future Enhancements

- [ ] Add E2E tests with Playwright
- [ ] Add visual regression tests
- [ ] Add performance benchmarks
- [ ] Add accessibility tests (WCAG compliance)
- [ ] Add API contract tests
- [ ] Add security penetration tests
