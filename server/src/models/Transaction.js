// src/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  from: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  to: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  tokenId: {
    type: Number,
    required: true
  },
  contractAddress: {
    type: String,
    required: true
  },
  nft: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NFT'
  },
  type: {
    type: String,
    enum: ['mint', 'transfer', 'sale', 'burn'],
    required: true
  },
  value: {
    type: String,
    default: '0'
  },
  currency: {
    type: String,
    default: 'ETH'
  },
  gasUsed: String,
  gasPrice: String,
  blockNumber: Number,
  blockTimestamp: Date,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  confirmations: {
    type: Number,
    default: 0
  },
  metadata: {
    method: String,
    input: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes
transactionSchema.index({ blockTimestamp: -1 });
transactionSchema.index({ from: 1, createdAt: -1 });
transactionSchema.index({ to: 1, createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;