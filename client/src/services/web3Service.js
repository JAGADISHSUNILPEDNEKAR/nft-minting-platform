// src/services/web3Service.js
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CHAIN_CONFIG } from '../utils/constants';
import contractABI from '../../contracts/artifacts/contracts/NFTMinting.sol/NFTMinting.json';

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }

  async initialize() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.signer = this.provider.getSigner();
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, this.signer);
  }

  async connectWallet() {
    try {
      const accounts = await this.provider.send('eth_requestAccounts', []);
      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  async getBalance(address) {
    const balance = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  }

  async getNetwork() {
    return await this.provider.getNetwork();
  }

  async switchNetwork(chainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        const chainConfig = CHAIN_CONFIG[chainId];
        if (chainConfig) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${chainId.toString(16)}`,
                chainName: chainConfig.name,
                nativeCurrency: {
                  name: chainConfig.currency,
                  symbol: chainConfig.currency,
                  decimals: 18,
                },
                rpcUrls: [chainConfig.rpcUrl],
                blockExplorerUrls: [chainConfig.explorerUrl],
              },
            ],
          });
        }
      } else {
        throw error;
      }
    }
  }

  async mintNFT(tokenURI) {
    const mintPrice = await this.contract.mintPrice();
    const tx = await this.contract.mintNFT(tokenURI, { value: mintPrice });
    return await tx.wait();
  }

  async batchMintNFT(tokenURIs) {
    const mintPrice = await this.contract.mintPrice();
    const totalPrice = mintPrice.mul(tokenURIs.length);
    const tx = await this.contract.batchMintNFT(tokenURIs, { value: totalPrice });
    return await tx.wait();
  }

  async transferNFT(to, tokenId) {
    const tx = await this.contract.transferNFT(to, tokenId);
    return await tx.wait();
  }

  async getOwnershipHistory(tokenId) {
    return await this.contract.getOwnershipHistory(tokenId);
  }

  async getUserOwnedTokens(address) {
    return await this.contract.getUserOwnedTokens(address);
  }

  async getTokenURI(tokenId) {
    return await this.contract.tokenURI(tokenId);
  }

  async getTotalSupply() {
    const supply = await this.contract.totalSupply();
    return supply.toString();
  }

  async getMintPrice() {
    const price = await this.contract.mintPrice();
    return ethers.utils.formatEther(price);
  }

  async getMaxSupply() {
    const supply = await this.contract.maxSupply();
    return supply.toString();
  }

  async isOwner(tokenId, address) {
    try {
      const owner = await this.contract.ownerOf(tokenId);
      return owner.toLowerCase() === address.toLowerCase();
    } catch (error) {
      return false;
    }
  }
}

export default new Web3Service();

