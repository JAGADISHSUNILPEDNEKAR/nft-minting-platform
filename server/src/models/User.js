// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  profile: {
    displayName: String,
    bio: String,
    avatar: String,
    banner: String,
    social: {
      twitter: String,
      discord: String,
      website: String
    }
  },
  nonce: {
    type: String,
    default: () => Math.floor(Math.random() * 1000000).toString()
  },
  mintedNFTs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NFT'
  }],
  ownedNFTs: [{
    tokenId: Number,
    contractAddress: String
  }],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NFT'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'creator', 'admin'],
    default: 'user'
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.generateNonce = function() {
  this.nonce = Math.floor(Math.random() * 1000000).toString();
  return this.nonce;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

