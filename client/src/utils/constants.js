// /* src/utils/constants.js
export const CHAIN_CONFIG = {
  1: {
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
  },
  5: {
    name: 'Goerli Testnet',
    currency: 'ETH',
    explorerUrl: 'https://goerli.etherscan.io',
    rpcUrl: `https://goerli.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
  },
  137: {
    name: 'Polygon',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com',
  },
  80001: {
    name: 'Mumbai Testnet',
    currency: 'MATIC',
    explorerUrl: 'https://mumbai.polygonscan.com',
    rpcUrl: `https://polygon-mumbai.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
  },
  1337: {
    name: 'Localhost',
    currency: 'ETH',
    explorerUrl: '',
    rpcUrl: 'http://localhost:8545',
  },
};

export const NFT_CATEGORIES = [
  { value: 'art', label: 'Art' },
  { value: 'photography', label: 'Photography' },
  { value: 'music', label: 'Music' },
  { value: 'video', label: 'Video' },
  { value: 'collectible', label: 'Collectible' },
  { value: 'utility', label: 'Utility' },
  { value: 'other', label: 'Other' },
];

export const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const SUPPORTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/svg+xml': ['.svg'],
  'video/mp4': ['.mp4'],
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const MINT_PRICE = '0.01'; // ETH

export const GAS_LIMIT = {
  MINT: 300000,
  TRANSFER: 100000,
  BATCH_MINT: 500000,
};