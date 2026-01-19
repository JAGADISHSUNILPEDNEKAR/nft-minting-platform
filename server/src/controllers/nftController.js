// src/controllers/nftController.js
const NFT = require('../models/NFT');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { ethers } = require('ethers');
const { validationResult } = require('express-validator');

const provider = new ethers.JsonRpcProvider(
  process.env.INFURA_URL || 'http://localhost:8545'
);

const contractABI = require('../../../contracts/artifacts/contracts/NFTMinting.sol/NFTMinting.json').abi;
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  provider
);

const createNFT = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tokenId, contractAddress, metadata, ipfsHash, imageIpfsHash, transactionHash } = req.body;

    // Verify the NFT exists on-chain
    const owner = await contract.ownerOf(tokenId);

    if (owner.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
      return res.status(403).json({ message: 'You are not the owner of this NFT' });
    }

    // Check if NFT already exists in database
    const existingNFT = await NFT.findOne({ tokenId, contractAddress });
    if (existingNFT) {
      return res.status(400).json({ message: 'NFT already exists' });
    }

    // Create NFT record
    const nft = await NFT.create({
      tokenId,
      contractAddress,
      creator: req.user._id,
      currentOwner: req.user.walletAddress,
      metadata,
      ipfsHash,
      imageIpfsHash,
      ownershipHistory: [{
        owner: req.user.walletAddress,
        timestamp: new Date(),
        transactionHash
      }],
      transactionHistory: [{
        from: '0x0000000000000000000000000000000000000000',
        to: req.user.walletAddress,
        timestamp: new Date(),
        transactionHash,
        event: 'mint'
      }]
    });

    // Update user's minted NFTs
    await User.findByIdAndUpdate(req.user._id, {
      $push: { mintedNFTs: nft._id }
    });

    // Create transaction record
    await Transaction.create({
      transactionHash,
      from: '0x0000000000000000000000000000000000000000',
      to: req.user.walletAddress,
      tokenId,
      contractAddress,
      nft: nft._id,
      type: 'mint',
      status: 'confirmed'
    });

    res.status(201).json(nft);
  } catch (error) {
    console.error('Create NFT error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getNFTs = async (req, res) => {
  try {
    const { page = 1, limit = 20, owner, creator, category, search, sort = '-createdAt' } = req.query;

    const query = {};

    if (owner) {
      query.currentOwner = owner.toLowerCase();
    }

    if (creator) {
      const user = await User.findOne({ walletAddress: creator.toLowerCase() });
      if (user) {
        query.creator = user._id;
      }
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const nfts = await NFT.find(query)
      .populate('creator', 'walletAddress username profile.displayName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await NFT.countDocuments(query);

    res.json({
      nfts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get NFTs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getNFTById = async (req, res) => {
  try {
    const { id } = req.params;

    const nft = await NFT.findById(id)
      .populate('creator', 'walletAddress username profile');

    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    // Increment view count
    await nft.incrementView();

    // Get on-chain data
    const tokenURI = await contract.tokenURI(nft.tokenId);
    const owner = await contract.ownerOf(nft.tokenId);
    const ownershipHistory = await contract.getOwnershipHistory(nft.tokenId);

    res.json({
      ...nft.toObject(),
      onChainData: {
        tokenURI,
        currentOwner: owner,
        ownershipHistory
      }
    });
  } catch (error) {
    console.error('Get NFT error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const transferNFT = async (req, res) => {
  try {
    const { tokenId, toAddress, transactionHash } = req.body;

    const nft = await NFT.findOne({ tokenId, contractAddress: process.env.CONTRACT_ADDRESS });

    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    if (nft.currentOwner.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
      return res.status(403).json({ message: 'You are not the owner of this NFT' });
    }

    // Update NFT ownership
    nft.currentOwner = toAddress.toLowerCase();
    nft.ownershipHistory.push({
      owner: toAddress.toLowerCase(),
      timestamp: new Date(),
      transactionHash
    });
    nft.transactionHistory.push({
      from: req.user.walletAddress,
      to: toAddress.toLowerCase(),
      timestamp: new Date(),
      transactionHash,
      event: 'transfer'
    });

    await nft.save();

    // Create transaction record
    await Transaction.create({
      transactionHash,
      from: req.user.walletAddress,
      to: toAddress.toLowerCase(),
      tokenId,
      contractAddress: process.env.CONTRACT_ADDRESS,
      nft: nft._id,
      type: 'transfer',
      status: 'confirmed'
    });

    res.json(nft);
  } catch (error) {
    console.error('Transfer NFT error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserNFTs = async (req, res) => {
  try {
    const { address } = req.params;

    // Get on-chain NFTs
    const balance = await contract.balanceOf(address);
    const tokenIds = [];

    for (let i = 0; i < balance; i++) {
      const tokenId = await contract.tokenOfOwnerByIndex(address, i);
      tokenIds.push(tokenId.toString());
    }

    // Get NFT metadata from database
    const nfts = await NFT.find({
      tokenId: { $in: tokenIds },
      contractAddress: process.env.CONTRACT_ADDRESS
    }).populate('creator', 'walletAddress username profile.displayName');

    res.json(nfts);
  } catch (error) {
    console.error('Get user NFTs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createNFT,
  getNFTs,
  getNFTById,
  transferNFT,
  getUserNFTs
};

