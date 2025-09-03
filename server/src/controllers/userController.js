// src/controllers/userController.js
const User = require('../models/User');
const { generateToken, verifySignature } = require('../middleware/authMiddleware');
const { validationResult } = require('express-validator');

const getNonce = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }
    
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!user) {
      user = await User.create({
        walletAddress: walletAddress.toLowerCase()
      });
    }
    
    res.json({ nonce: user.nonce });
  } catch (error) {
    console.error('Get nonce error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const authenticate = async (req, res) => {
  try {
    const { walletAddress } = req;
    
    let user = await User.findOne({ walletAddress });
    
    if (!user) {
      user = await User.create({ walletAddress });
    }
    
    // Generate new nonce for next login
    user.generateNonce();
    user.lastLogin = Date.now();
    await user.save();
    
    const token = generateToken(walletAddress);
    
    res.json({
      token,
      user: {
        _id: user._id,
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email,
        profile: user.profile,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('mintedNFTs')
      .populate('favorites');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { username, email, profile } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if username is taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }
    
    // Check if email is taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already taken' });
      }
      user.email = email;
    }
    
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }
    
    await user.save();
    
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserByAddress = async (req, res) => {
  try {
    const { address } = req.params;
    
    const user = await User.findOne({ walletAddress: address.toLowerCase() })
      .populate('mintedNFTs')
      .select('-nonce');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getNonce,
  authenticate,
  getProfile,
  updateProfile,
  getUserByAddress
};

