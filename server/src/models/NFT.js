// src/models/NFT.js
const mongoose = require('mongoose');

const nftSchema = new mongoose.Schema({
  tokenId: {
    type: Number,
    required: true,
    index: true
  },
  contractAddress: {
    type: String,
    required: true,
    index: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentOwner: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  metadata: {
    name: {
      type: String,
      required: true,
      index: true
    },
    description: String,
    image: {
      type: String,
      required: true
    },
    external_url: String,
    attributes: [{
      trait_type: String,
      value: mongoose.Schema.Types.Mixed,
      display_type: String
    }],
    properties: {
      files: [{
        uri: String,
        type: String
      }],
      category: String,
      creators: [{
        address: String,
        share: Number
      }]
    }
  },
  ipfsHash: {
    type: String,
    required: true,
    unique: true
  },
  imageIpfsHash: {
    type: String,
    required: true
  },
  ownershipHistory: [{
    owner: String,
    timestamp: Date,
    transactionHash: String,
    price: String
  }],
  transactionHistory: [{
    from: String,
    to: String,
    timestamp: Date,
    transactionHash: String,
    event: {
      type: String,
      enum: ['mint', 'transfer', 'sale', 'list', 'delist']
    },
    price: String,
    currency: String
  }],
  stats: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  listing: {
    isListed: {
      type: Boolean,
      default: false
    },
    price: String,
    currency: String,
    expiresAt: Date
  },
  category: {
    type: String,
    enum: ['art', 'photography', 'music', 'video', 'collectible', 'utility', 'other'],
    default: 'art'
  },
  tags: [String],
  isVerified: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
nftSchema.index({ tokenId: 1, contractAddress: 1 }, { unique: true });
nftSchema.index({ 'metadata.name': 'text', 'metadata.description': 'text' });
nftSchema.index({ createdAt: -1 });
nftSchema.index({ 'stats.views': -1 });

nftSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

nftSchema.methods.incrementView = async function() {
  this.stats.views += 1;
  return this.save();
};

const NFT = mongoose.model('NFT', nftSchema);
module.exports = NFT;

