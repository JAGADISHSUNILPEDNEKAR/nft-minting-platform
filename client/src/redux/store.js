// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './slices/walletSlice';
import nftReducer from './slices/nftSlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    nft: nftReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['wallet/connectWallet/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.provider', 'payload.signer'],
        // Ignore these paths in the state
        ignoredPaths: ['wallet.provider', 'wallet.signer'],
      },
    }),
});

