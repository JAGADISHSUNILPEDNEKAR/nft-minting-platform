// src/App.js
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container } from '@mui/material';
import Layout from './components/Layout';
import WalletConnect from './components/WalletConnect';
import NFTMint from './components/NFTMint';
import NFTGallery from './components/NFTGallery';
import NFTDetails from './components/NFTDetails';
import NFTTransfer from './components/NFTTransfer';
import { connectWallet } from './redux/slices/walletSlice';

function App() {
  const dispatch = useDispatch();
  const { address } = useSelector((state) => state.wallet);

  useEffect(() => {
    // Auto-connect wallet if previously connected
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          if (accounts.length > 0) {
            dispatch(connectWallet());
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          dispatch(connectWallet());
        } else {
          window.location.reload();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [dispatch]);

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<NFTGallery />} />
          <Route path="/connect" element={<WalletConnect />} />
          <Route
            path="/mint"
            element={address ? <NFTMint /> : <Navigate to="/connect" />}
          />
          <Route path="/gallery" element={<NFTGallery />} />
          <Route path="/nft/:id" element={<NFTDetails />} />
          <Route
            path="/transfer/:id"
            element={address ? <NFTTransfer /> : <Navigate to="/connect" />}
          />
          <Route path="/my-nfts" element={
            address ? <NFTGallery userOnly={true} /> : <Navigate to="/connect" />
          } />
        </Routes>
      </Container>
    </Layout>
  );
}

export default App;

