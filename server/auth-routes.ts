import { Router } from 'express';
import { storage } from './storage';
import { hashPassword, verifyPassword, authenticateUser } from './middleware/auth';
import { randomUUID } from 'crypto';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, customerId } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    // Check if user already exists
    const existingEmail = await storage.getUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const existingUsername = await storage.getUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with default role 'viewer'
    const user = await storage.createUser({
      id: randomUUID(),
      customerId: customerId || null,
      email,
      username,
      password: hashedPassword,
      role: 'viewer',
      status: 'active',
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Set session
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
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    // Find user by email or username
    let user = await storage.getUserByEmail(identifier);
    if (!user) {
      user = await storage.getUserByUsername(identifier);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await storage.updateUser(user.id, { lastLoginAt: new Date() });

    // Set session
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
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
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
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await storage.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;