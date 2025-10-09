// src/services/apiService.js
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    
    // Create axios instance
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('token');
          window.location.href = '/connect';
        }
        return Promise.reject(error);
      }
    );
  }

  // User endpoints
  async getNonce(walletAddress) {
    const response = await this.api.get(`/users/nonce/${walletAddress}`);
    return response.data;
  }

  async authenticate(walletAddress, signature, message) {
    const response = await this.api.post('/users/authenticate', {
      walletAddress,
      signature,
      message,
    });
    return response.data;
  }

  async getUserProfile() {
    const response = await this.api.get('/users/profile');
    return response.data;
  }

  async updateUserProfile(profileData) {
    const response = await this.api.put('/users/profile', profileData);
    return response.data;
  }

  async getUserByAddress(address) {
    const response = await this.api.get(`/users/address/${address}`);
    return response.data;
  }

  // NFT endpoints
  async createNFT(nftData) {
    const response = await this.api.post('/nfts', nftData);
    return response.data;
  }

  async getNFTs(params = {}) {
    const response = await this.api.get('/nfts', { params });
    return response.data;
  }

  async getNFTById(id) {
    const response = await this.api.get(`/nfts/${id}`);
    return response.data;
  }

  async transferNFT(tokenId, toAddress, transactionHash) {
    const response = await this.api.post('/nfts/transfer', {
      tokenId,
      toAddress,
      transactionHash,
    });
    return response.data;
  }

  async getUserNFTs(address) {
    const response = await this.api.get(`/nfts/user/${address}`);
    return response.data;
  }

  // Transaction endpoints
  async getTransactionHistory(address) {
    const response = await this.api.get(`/transactions/address/${address}`);
    return response.data;
  }

  async getTransactionByHash(hash) {
    const response = await this.api.get(`/transactions/hash/${hash}`);
    return response.data;
  }
}

export default new ApiService();