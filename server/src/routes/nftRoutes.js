// src/routes/nftRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createNFT,
  getNFTs,
  getNFTById,
  transferNFT,
  getUserNFTs
} = require('../controllers/nftController');
const { verifyToken, optionalAuth } = require('../middleware/authMiddleware');

// Public routes
router.get('/', optionalAuth, getNFTs);
router.get('/user/:address', getUserNFTs);
router.get('/:id', optionalAuth, getNFTById);

// Protected routes
router.post(
  '/',
  verifyToken,
  [
    body('tokenId').isNumeric(),
    body('contractAddress').isEthereumAddress(),
    body('metadata').isObject(),
    body('ipfsHash').notEmpty(),
    body('imageIpfsHash').notEmpty(),
    body('transactionHash').isHexadecimal()
  ],
  createNFT
);

router.post(
  '/transfer',
  verifyToken,
  [
    body('tokenId').isNumeric(),
    body('toAddress').isEthereumAddress(),
    body('transactionHash').isHexadecimal()
  ],
  transferNFT
);

module.exports = router;

