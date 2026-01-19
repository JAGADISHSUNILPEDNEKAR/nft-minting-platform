// src/redux/slices/nftSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { API_BASE_URL, CONTRACT_ADDRESS } from '../../utils/constants';
import contractABI from '../../contracts/NFTMinting.json';

export const mintNFT = createAsyncThunk(
  'nft/mintNFT',
  async ({ tokenURI, signer }) => {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
    const mintPrice = await contract.mintPrice();

    const tx = await contract.mintNFT(tokenURI, { value: mintPrice });
    const receipt = await tx.wait();

    // Find the NFTMinted event
    const event = receipt.events.find(e => e.event === 'NFTMinted');
    const tokenId = event.args.tokenId.toString();

    return {
      tokenId,
      transactionHash: receipt.transactionHash,
      tokenURI,
    };
  }
);

export const fetchNFTs = createAsyncThunk(
  'nft/fetchNFTs',
  async ({ page = 1, limit = 20, owner, category, search, sort }) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...(owner && { owner }),
      ...(category && { category }),
      ...(search && { search }),
      ...(sort && { sort }),
    });

    const response = await fetch(`${API_BASE_URL}/nfts?${params}`);
    const data = await response.json();

    return data;
  }
);

export const fetchNFTDetails = createAsyncThunk(
  'nft/fetchNFTDetails',
  async (id) => {
    const response = await fetch(`${API_BASE_URL}/nfts/${id}`);
    const data = await response.json();

    return data;
  }
);

export const transferNFT = createAsyncThunk(
  'nft/transferNFT',
  async ({ tokenId, toAddress, signer }) => {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

    const tx = await contract.transferNFT(toAddress, tokenId);
    const receipt = await tx.wait();

    return {
      tokenId,
      toAddress,
      transactionHash: receipt.transactionHash,
    };
  }
);

export const fetchUserNFTs = createAsyncThunk(
  'nft/fetchUserNFTs',
  async (address) => {
    const response = await fetch(`${API_BASE_URL}/nfts/user/${address}`);
    const data = await response.json();

    return data;
  }
);

const nftSlice = createSlice({
  name: 'nft',
  initialState: {
    nfts: [],
    userNFTs: [],
    selectedNFT: null,
    totalPages: 1,
    currentPage: 1,
    total: 0,
    isLoading: false,
    isMinting: false,
    isTransferring: false,
    error: null,
  },
  reducers: {
    clearSelectedNFT: (state) => {
      state.selectedNFT = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Mint NFT
      .addCase(mintNFT.pending, (state) => {
        state.isMinting = true;
        state.error = null;
      })
      .addCase(mintNFT.fulfilled, (state, action) => {
        state.isMinting = false;
        toast.success(`NFT minted successfully! Token ID: ${action.payload.tokenId}`);
      })
      .addCase(mintNFT.rejected, (state, action) => {
        state.isMinting = false;
        state.error = action.error.message;
        toast.error(`Minting failed: ${action.error.message}`);
      })
      // Fetch NFTs
      .addCase(fetchNFTs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNFTs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nfts = action.payload.nfts;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(fetchNFTs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Fetch NFT Details
      .addCase(fetchNFTDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNFTDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedNFT = action.payload;
      })
      .addCase(fetchNFTDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Transfer NFT
      .addCase(transferNFT.pending, (state) => {
        state.isTransferring = true;
        state.error = null;
      })
      .addCase(transferNFT.fulfilled, (state, action) => {
        state.isTransferring = false;
        toast.success(`NFT transferred successfully to ${action.payload.toAddress}`);
      })
      .addCase(transferNFT.rejected, (state, action) => {
        state.isTransferring = false;
        state.error = action.error.message;
        toast.error(`Transfer failed: ${action.error.message}`);
      })
      // Fetch User NFTs
      .addCase(fetchUserNFTs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserNFTs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userNFTs = action.payload;
      })
      .addCase(fetchUserNFTs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearSelectedNFT, clearError } = nftSlice.actions;
export default nftSlice.reducer;