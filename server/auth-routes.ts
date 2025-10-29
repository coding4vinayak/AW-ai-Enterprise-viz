
import { Router } from 'express';
import { storage } from './storage';
import { hashPassword, verifyPassword, authenticateUser } from './middleware/auth';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    const isValid = await verifyPassword(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await storage.updateUserLastLogin(user.id);

    // Create session
    req.session.userId = user.id;
    
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Failed to create session' });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          customerId: user.customerId,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

// Get current user
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = await storage.getUserById(req.user!.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      customerId: user.customerId,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Register endpoint (for initial setup or customer admin creating users)
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if email already exists
    const existingUser = await storage.getUserByEmail(data.email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Check if username already exists
    const existingUsername = await storage.getUserByUsername(data.username);
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Get default customer
    const defaultCustomer = await storage.getCustomerBySlug('default');
    if (!defaultCustomer) {
      return res.status(500).json({ error: 'Default customer not found' });
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await storage.createUser({
      ...data,
      password: hashedPassword,
      customerId: defaultCustomer.id,
      role: 'analyst', // Default role
      status: 'active',
    });

    // Create session
    req.session.userId = user.id;
    
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Failed to create session' });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          customerId: user.customerId,
        },
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

export default router;
