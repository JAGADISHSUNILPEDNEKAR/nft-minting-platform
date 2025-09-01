# NFT Minting Platform - Dependencies Installation Guide

## Frontend (client/) Dependencies

```bash
cd client
npm init -y

# Core React dependencies
npm install react react-dom react-router-dom

# Redux state management
npm install @reduxjs/toolkit react-redux

# Web3 dependencies
npm install ethers web3 @metamask/sdk

# UI framework (Material-UI)
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

# IPFS integration
npm install ipfs-http-client axios

# Utilities
npm install dotenv react-toastify

# Development dependencies
npm install --save-dev @types/react @types/react-dom
```

### Frontend package.json dependencies:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@reduxjs/toolkit": "^1.9.0",
    "react-redux": "^8.0.5",
    "ethers": "^6.7.0",
    "web3": "^4.0.0",
    "@metamask/sdk": "^0.12.0",
    "@mui/material": "^5.11.0",
    "@emotion/react": "^11.10.0",
    "@emotion/styled": "^11.10.0",
    "@mui/icons-material": "^5.11.0",
    "ipfs-http-client": "^60.0.0",
    "axios": "^1.3.0",
    "dotenv": "^16.0.0",
    "react-toastify": "^9.1.0"
  }
}
```

## Backend (server/) Dependencies

```bash
cd server
npm init -y

# Core backend dependencies
npm install express cors dotenv helmet morgan

# Database
npm install mongoose

# Web3 dependencies
npm install ethers web3

# File handling & IPFS
npm install multer ipfs-http-client @pinata/sdk

# Authentication & security
npm install jsonwebtoken bcryptjs express-rate-limit

# Utilities
npm install express-validator

# Development dependencies
npm install --save-dev nodemon
```

### Backend package.json dependencies:
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "mongoose": "^7.0.0",
    "ethers": "^6.7.0",
    "web3": "^4.0.0",
    "multer": "^1.4.5-lts.1",
    "ipfs-http-client": "^60.0.0",
    "@pinata/sdk": "^2.1.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "express-rate-limit": "^6.7.0",
    "express-validator": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

## Smart Contracts (contracts/) Dependencies

```bash
cd contracts
npm init -y

# Hardhat and development tools
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# OpenZeppelin contracts
npm install @openzeppelin/contracts

# Testing
npm install --save-dev chai @types/chai @types/mocha

# Additional utilities
npm install --save-dev dotenv
```

### Contracts package.json dependencies:
```json
{
  "devDependencies": {
    "hardhat": "^2.12.0",
    "@nomicfoundation/hardhat-toolbox": "^2.0.0",
    "@nomicfoundation/hardhat-network-helpers": "^1.0.0",
    "@nomicfoundation/hardhat-chai-matchers": "^1.0.0",
    "@nomiclabs/hardhat-ethers": "^2.0.0",
    "@nomiclabs/hardhat-etherscan": "^3.0.0",
    "@types/chai": "^4.2.0",
    "@types/mocha": "^9.1.0",
    "@typechain/ethers-v5": "^10.1.0",
    "@typechain/hardhat": "^6.1.2",
    "chai": "^4.2.0",
    "ethers": "^5.7.0",
    "hardhat-gas-reporter": "^1.0.8",
    "solidity-coverage": "^0.8.0",
    "typechain": "^8.1.0",
    "dotenv": "^16.0.0"
  },
  "dependencies": {
    "@openzeppelin/contracts": "^4.8.0"
  }
}
```

## Root Project Setup

### Install all dependencies at once:

```bash
# From root directory
npm init -y

# Install concurrently to run multiple servers
npm install --save-dev concurrently

# Root package.json scripts
```

### Root package.json:
```json
{
  "name": "nft-minting-platform",
  "version": "1.0.0",
  "scripts": {
    "install-all": "npm install && cd client && npm install && cd ../server && npm install && cd ../contracts && npm install",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd server && npm run dev",
    "client": "cd client && npm start",
    "contracts": "cd contracts && npx hardhat node",
    "deploy": "cd contracts && npx hardhat run scripts/deploy.js --network localhost",
    "test-contracts": "cd contracts && npx hardhat test"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}
```

## Environment Variables

### Client (.env)
```env
REACT_APP_PINATA_API_KEY=your_pinata_api_key
REACT_APP_PINATA_SECRET_KEY=your_pinata_secret_key
REACT_APP_CONTRACT_ADDRESS=deployed_contract_address
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_INFURA_ID=your_infura_project_id
```

### Server (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nft-platform
JWT_SECRET=your_jwt_secret_key
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
INFURA_URL=https://mainnet.infura.io/v3/your_infura_id
CONTRACT_ADDRESS=deployed_contract_address
PRIVATE_KEY=your_wallet_private_key
```

### Contracts (.env)
```env
PRIVATE_KEY=your_wallet_private_key
INFURA_API_KEY=your_infura_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Installation Steps

1. Clone the repository and navigate to root directory
2. Run `npm run install-all` to install all dependencies
3. Set up MongoDB locally or use MongoDB Atlas
4. Configure all .env files with your API keys
5. Deploy smart contracts: `npm run deploy`
6. Update CONTRACT_ADDRESS in client and server .env files
7. Start development servers: `npm run dev`