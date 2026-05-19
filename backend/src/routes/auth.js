const express = require('express');
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_TTL = '30d';

function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

const registerRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isString().isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
  body('username').isString().trim().notEmpty().withMessage('username is required').isLength({ max: 50 }).withMessage('username too long'),
];

// POST /api/v1/auth/register
router.post('/register', registerRules, validate, async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      'INSERT INTO users (email, password_hash, username) VALUES ($1, $2, $3) RETURNING id, email, username',
      [email.toLowerCase().trim(), passwordHash, username.trim()]
    );
    const user = result.rows[0];
    res.status(201).json({ token: makeToken(user), user: { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    if (err.code === '23505') {
      const field = err.constraint?.includes('email') ? 'email' : 'username';
      return res.status(409).json({ error: { code: 'CONFLICT', message: `That ${field} is already taken` } });
    }
    console.error('Register error:', err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Registration failed' } });
  }
});

const loginRules = [
  body('email').isString().trim().notEmpty().withMessage('email is required'),
  body('password').isString().notEmpty().withMessage('password is required'),
];

// POST /api/v1/auth/login
router.post('/login', loginRules, validate, async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await query(
      'SELECT id, email, username, password_hash FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }
    res.json({ token: makeToken(user), user: { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Login failed' } });
  }
});

// GET /api/v1/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT id, email, username, bio, created_at FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    res.json({ user });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch user' } });
  }
});

const updateProfileRules = [
  body('username').isString().trim().notEmpty().withMessage('username is required').isLength({ max: 50 }),
  body('bio').optional({ nullable: true }).isString().isLength({ max: 500 }).withMessage('bio max 500 chars'),
];

// PUT /api/v1/auth/profile
router.put('/profile', requireAuth, updateProfileRules, validate, async (req, res) => {
  const { username, bio } = req.body;
  try {
    const result = await query(
      'UPDATE users SET username = $1, bio = $2, updated_at = NOW() WHERE id = $3 RETURNING id, email, username, bio, created_at',
      [username.trim(), bio?.trim() ?? '', req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    res.json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: { code: 'CONFLICT', message: 'That username is already taken' } });
    }
    console.error('Update profile error:', err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to update profile' } });
  }
});

const changePasswordRules = [
  body('currentPassword').isString().notEmpty().withMessage('currentPassword is required'),
  body('newPassword').isString().isLength({ min: 4 }).withMessage('newPassword must be at least 4 characters'),
];

// PUT /api/v1/auth/password
router.put('/password', requireAuth, changePasswordRules, validate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Current password is incorrect' } });
    }
    const newHash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to change password' } });
  }
});

module.exports = router;
