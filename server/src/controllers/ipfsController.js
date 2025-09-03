// src/controllers/ipfsController.js
const pinataSDK = require('@pinata/sdk');
const { create } = require('ipfs-http-client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize Pinata
const pinata = pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_KEY
);

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mp3|pdf|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
}).single('file');

const uploadToIPFS = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const readableStreamForFile = fs.createReadStream(req.file.path);
      
      const options = {
        pinataMetadata: {
          name: req.file.originalname,
          keyvalues: {
            uploadedBy: req.user?.walletAddress || 'anonymous',
            timestamp: new Date().toISOString()
          }
        },
        pinataOptions: {
          cidVersion: 0
        }
      };
      
      const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json({
        ipfsHash: result.IpfsHash,
        pinSize: result.PinSize,
        timestamp: result.Timestamp,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
      });
    } catch (error) {
      console.error('IPFS upload error:', error);
      
      // Clean up file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ message: 'Failed to upload to IPFS' });
    }
  });
};

const uploadJSONToIPFS = async (req, res) => {
  try {
    const { metadata } = req.body;
    
    if (!metadata) {
      return res.status(400).json({ message: 'Metadata is required' });
    }
    
    const options = {
      pinataMetadata: {
        name: metadata.name || 'NFT Metadata',
        keyvalues: {
          uploadedBy: req.user?.walletAddress || 'anonymous',
          timestamp: new Date().toISOString()
        }
      },
      pinataOptions: {
        cidVersion: 0
      }
    };
    
    const result = await pinata.pinJSONToIPFS(metadata, options);
    
    res.json({
      ipfsHash: result.IpfsHash,
      pinSize: result.PinSize,
      timestamp: result.Timestamp,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    });
  } catch (error) {
    console.error('IPFS JSON upload error:', error);
    res.status(500).json({ message: 'Failed to upload metadata to IPFS' });
  }
};

const getFromIPFS = async (req, res) => {
  try {
    const { hash } = req.params;
    
    // You can use Pinata gateway or any public IPFS gateway
    const url = `https://gateway.pinata.cloud/ipfs/${hash}`;
    
    res.json({ url });
  } catch (error) {
    console.error('IPFS get error:', error);
    res.status(500).json({ message: 'Failed to get from IPFS' });
  }
};

module.exports = {
  uploadToIPFS,
  uploadJSONToIPFS,
  getFromIPFS
};