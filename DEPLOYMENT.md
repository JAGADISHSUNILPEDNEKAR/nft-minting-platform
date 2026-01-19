# NFT Minting Platform Deployment Guide

This guide will help you deploy the NFT Minting Platform to production using:
- **Smart Contracts**: Sepolia (Ethereum) or Amoy (Polygon) Testnets
- **Database**: MongoDB Atlas
- **Backend**: Render or Railway
- **Frontend**: Vercel

## Prerequisites

Ensure you have the following accounts and keys:
1.  **MetaMask Wallet** with testnet ETH (Sepolia) or MATIC (Amoy).
2.  **Infura API Key** (for RPC access).
3.  **Pinata API Keys** (API Key & Secret) for IPFS storage.
4.  **MongoDB Atlas** account.
5.  **GitHub** account (for connecting to Vercel/Render).

---

## Part 1: Smart Contracts (Blockchain)

1.  **Environment Setup**:
    Navigate to `contracts/` and create/update `.env`:
    ```ini
    INFURA_API_KEY=your_infura_key
    PRIVATE_KEY=your_wallet_private_key
    ETHERSCAN_API_KEY=your_etherscan_key_optional
    ```

2.  **Deploy**:
    Run the deployment script for your chosen network:
    ```bash
    # For Sepolia (Ethereum)
    npx hardhat run scripts/deploy.js --network sepolia

    # For Amoy (Polygon)
    npx hardhat run scripts/deploy.js --network amoy
    ```

3.  **Save the Address**:
    Copy the deployed **Contract Address** output by the script. You will need this for the Client and Server.

---

## Part 2: Database (MongoDB Atlas)

1.  Create a new Cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2.  Create a Database User (Username/Password).
3.  Get the Connection String (Driver: Node.js):
    `mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/?retryWrites=true&w=majority`

---

## Part 3: Backend (Render/Railway)

We recommend **Render** or **Railway** for hosting the Node.js Express server.

1.  Push your code to **GitHub**.
2.  Create a new **Web Service** on Render/Railway and connect your repo.
3.  **Root Directory**: `server`
4.  **Build Command**: `npm install`
5.  **Start Command**: `npm start`
6.  **Environment Variables**:
    Add these in the dashboard:
    - `PORT`: `5001` (or let the provider assign one)
    - `MONGODB_URI`: (Your Atlas Connection String)
    - `JWT_SECRET`: (A long random string)
    - `PINATA_API_KEY`: (Your Pinata Key)
    - `PINATA_SECRET_KEY`: (Your Pinata Secret)
    - `CONTRACT_ADDRESS`: (From Part 1)
    - `PRIVATE_KEY`: (Your wallet private key - *Keep this safe!*)

7.  **Deploy** and copy the **Service URL** (e.g., `https://nft-server.onrender.com`).

---

## Part 4: Frontend (Vercel)

1.  Go to [Vercel](https://vercel.com) and "Add New Project".
2.  Import your GitHub repository.
3.  **Framework Preset**: Create React App
4.  **Root Directory**: `client`
5.  **Environment Variables**:
    - `REACT_APP_API_URL`: (Your Backend Service URL, e.g., `https://nft-server.onrender.com/api`)
    - `REACT_APP_CONTRACT_ADDRESS`: (From Part 1)
    - `REACT_APP_PINATA_API_KEY`: (Your Pinata Key)
    - `REACT_APP_PINATA_SECRET_KEY`: (Your Pinata Secret)
    - `REACT_APP_INFURA_ID`: (Your Infura Project ID)

6.  **Deploy**.

---

## Verification

- Visit your Vercel URL.
- Connect your Wallet (ensure you are on the correct testnet).
- Try minting an NFT to verify the flow.
