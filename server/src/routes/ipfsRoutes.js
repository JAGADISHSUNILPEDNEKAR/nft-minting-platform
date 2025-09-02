// src/routes/ipfsRoutes.js
const express = require('express');
const router = express.Router();
const {
  uploadToIPFS,
  uploadJSONToIPFS,
  getFromIPFS
} = require('../controllers/ipfsController');
const { verifyToken, optionalAuth } = require('../middleware/authMiddleware');

// IPFS routes
router.post('/upload', optionalAuth, uploadToIPFS);
router.post('/upload-json', optionalAuth, uploadJSONToIPFS);
router.get('/:hash', getFromIPFS);

module.exports = router;