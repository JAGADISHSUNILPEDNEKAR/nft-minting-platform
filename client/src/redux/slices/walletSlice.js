// src/redux/slices/walletSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../utils/constants';

export const connectWallet = createAsyncThunk(
  'wallet/connectWallet',
  async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const address = accounts[0];
    const signer = provider.getSigner();
    const balance = await provider.getBalance(address);
    const network = await provider.getNetwork();

    // Get nonce from backend
    const nonceResponse = await fetch(`${API_BASE_URL}/users/nonce/${address}`);
    const { nonce } = await nonceResponse.json();

    // Sign message
    const message = `Sign this message to authenticate with NFT Platform.\nNonce: ${nonce}`;
    const signature = await signer.signMessage(message);

    // Authenticate with backend
    const authResponse = await fetch(`${API_BASE_URL}/users/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: address,
        signature,
        message,
      }),
    });

    const authData = await authResponse.json();

    return {
      address,
      balance: ethers.utils.formatEther(balance),
      chainId: network.chainId,
      provider,
      signer,
      token: authData.token,
      user: authData.user,
    };
  }
);

export const disconnectWallet = createAsyncThunk(
  'wallet/disconnectWallet',
  async () => {
    return null;
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    address: null,
    balance: null,
    chainId: null,
    provider: null,
    signer: null,
    token: null,
    user: null,
    isConnecting: false,
    error: null,
  },
  reducers: {
    updateBalance: (state, action) => {
      state.balance = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.address = action.payload.address;
        state.balance = action.payload.balance;
        state.chainId = action.payload.chainId;
        state.provider = action.payload.provider;
        state.signer = action.payload.signer;
        state.token = action.payload.token;
        state.user = action.payload.user;
        
        // Store token in localStorage
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
        
        toast.success('Wallet connected successfully!');
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.error.message;
        toast.error(action.error.message);
      })
      .addCase(disconnectWallet.fulfilled, (state) => {
        state.address = null;
        state.balance = null;
        state.chainId = null;
        state.provider = null;
        state.signer = null;
        state.token = null;
        state.user = null;
        
        // Clear token from localStorage
        localStorage.removeItem('token');
        
        toast.info('Wallet disconnected');
      });
  },
});

export const { updateBalance, clearError } = walletSlice.actions;
export default walletSlice.reducer;

