import express from 'express';
import bcrypt from 'bcrypt';
import db from '../db.js';

const router = express.Router();

// Register/Signup route
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT * FROM "User" WHERE "Name" = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const result = await db.query(
      'INSERT INTO "User" ("Name", "Password") VALUES ($1, $2) RETURNING "user_id", "Name"',
      [username, hashedPassword]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.user_id,
        name: newUser.Name
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Find user by username
    const result = await db.query(
      'SELECT * FROM "User" WHERE "Name" = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    const user = result.rows[0];

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.Password);

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    // Login successful
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.user_id,
        name: user.Name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

export default router;

