// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getNonce,
  authenticate,
  getProfile,
  updateProfile,
  getUserByAddress
} = require('../controllers/userController');
const { verifyToken, verifySignature } = require('../middleware/authMiddleware');

// Public routes
router.get('/nonce/:walletAddress', getNonce);
router.post('/authenticate', verifySignature, authenticate);
router.get('/address/:address', getUserByAddress);

// Protected routes
router.get('/profile', verifyToken, getProfile);
router.put(
  '/profile',
  verifyToken,
  [
    body('username').optional().isLength({ min: 3, max: 30 }),
    body('email').optional().isEmail(),
    body('profile.displayName').optional().isLength({ max: 50 }),
    body('profile.bio').optional().isLength({ max: 500 })
  ],
  updateProfile
);

module.exports = router;

