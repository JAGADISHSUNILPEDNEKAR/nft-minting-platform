// src/services/ipfsService.js
import axios from 'axios';
import { API_BASE_URL, IPFS_GATEWAY } from '../utils/constants';

class IPFSService {
  constructor() {
    this.apiUrl = API_BASE_URL;
    this.gateway = IPFS_GATEWAY;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${this.apiUrl}/ipfs/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...this.getAuthHeaders(),
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  }

  async uploadJSON(metadata) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/ipfs/upload-json`,
        { metadata },
        {
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders(),
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw error;
    }
  }

  async uploadNFTMetadata(name, description, imageHash, attributes = []) {
    const metadata = {
      name,
      description,
      image: `${this.gateway}${imageHash}`,
      attributes,
      properties: {
        category: 'image',
      },
    };

    return await this.uploadJSON(metadata);
  }

  getIPFSUrl(hash) {
    return `${this.gateway}${hash}`;
  }

  async fetchMetadata(hash) {
    try {
      const response = await axios.get(this.getIPFSUrl(hash));
      return response.data;
    } catch (error) {
      console.error('Error fetching from IPFS:', error);
      throw error;
    }
  }
}

export default new IPFSService();

