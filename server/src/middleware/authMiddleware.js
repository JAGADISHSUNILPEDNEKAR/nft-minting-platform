// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const User = require('../models/User');

const generateToken = (walletAddress) => {
  return jwt.sign(
    { walletAddress },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
  );
};

const verifyToken = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      req.user = await User.findOne({ walletAddress: decoded.walletAddress }).select('-nonce');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const verifySignature = async (req, res, next) => {
  try {
    const { walletAddress, signature, message } = req.body;
    
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ 
        message: 'Wallet address, signature, and message are required' 
      });
    }
    
    // Verify the signature
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ message: 'Invalid signature' });
    }
    
    req.walletAddress = walletAddress.toLowerCase();
    next();
  } catch (error) {
    console.error('Signature verification error:', error);
    return res.status(401).json({ message: 'Signature verification failed' });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = await User.findOne({ walletAddress: decoded.walletAddress }).select('-nonce');
    } catch (error) {
      // Token invalid but continue as guest
      req.user = null;
    }
  }
  
  next();
};

const isAdmin = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  verifySignature,
  optionalAuth,
  isAdmin
};