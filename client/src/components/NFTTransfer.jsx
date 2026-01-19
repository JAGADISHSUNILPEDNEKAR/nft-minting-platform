// src/components/NFTTransfer.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Send,
  AccountBalanceWallet,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { transferNFT, fetchNFTDetails } from '../redux/slices/nftSlice';
import apiService from '../services/apiService';

const NFTTransfer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { address, signer } = useSelector((state) => state.wallet);
  const { selectedNFT, isTransferring } = useSelector((state) => state.nft);
  
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [transactionHash, setTransactionHash] = useState('');

  useEffect(() => {
    if (!selectedNFT || selectedNFT._id !== id) {
      dispatch(fetchNFTDetails(id));
    }
  }, [dispatch, id, selectedNFT]);

  useEffect(() => {
    // Validate Ethereum address
    if (recipientAddress) {
      setIsValidAddress(ethers.utils.isAddress(recipientAddress));
    } else {
      setIsValidAddress(false);
    }
  }, [recipientAddress]);

  const handleTransfer = async () => {
    if (!isValidAddress) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    if (recipientAddress.toLowerCase() === address.toLowerCase()) {
      toast.error('Cannot transfer to yourself');
      return;
    }

    try {
      setActiveStep(1);
      
      // Execute blockchain transfer
      const result = await dispatch(
        transferNFT({
          tokenId: selectedNFT.tokenId,
          toAddress: recipientAddress,
          signer,
        })
      ).unwrap();

      setTransactionHash(result.transactionHash);
      
      // Update backend
      await apiService.transferNFT(
        selectedNFT.tokenId,
        recipientAddress,
        result.transactionHash
      );

      setActiveStep(2);
      toast.success('NFT transferred successfully!');
      
      setTimeout(() => {
        navigate('/my-nfts');
      }, 3000);
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Transfer failed: ' + error.message);
      setActiveStep(0);
    }
  };

  if (!selectedNFT) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading NFT details...
        </Typography>
      </Box>
    );
  }

  const isOwner = selectedNFT.currentOwner?.toLowerCase() === address?.toLowerCase();

  if (!isOwner) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Warning sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          You don't own this NFT
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Only the current owner can transfer this NFT
        </Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Transfer NFT
      </Typography>

      {/* NFT Preview */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box
            component="img"
            src={selectedNFT.metadata?.image}
            alt={selectedNFT.metadata?.name}
            sx={{
              width: 80,
              height: 80,
              objectFit: 'cover',
              borderRadius: 1,
            }}
          />
          <Box>
            <Typography variant="h6">
              {selectedNFT.metadata?.name || `NFT #${selectedNFT.tokenId}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Token ID: #{selectedNFT.tokenId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Owner: {address.slice(0, 6)}...{address.slice(-4)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            <Step>
              <StepLabel>Enter Recipient Address</StepLabel>
              <StepContent>
                <TextField
                  fullWidth
                  label="Recipient Wallet Address"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  error={recipientAddress && !isValidAddress}
                  helperText={
                    recipientAddress && !isValidAddress
                      ? 'Invalid Ethereum address'
                      : 'Enter the wallet address of the recipient'
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountBalanceWallet />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />

                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Warning:</strong> Please double-check the recipient address.
                    Transfers cannot be reversed once confirmed.
                  </Typography>
                </Alert>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleTransfer}
                  disabled={!isValidAddress || isTransferring}
                  startIcon={<Send />}
                >
                  Transfer NFT
                </Button>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Confirm Transaction</StepLabel>
              <StepContent>
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CircularProgress size={48} sx={{ mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    Please confirm the transaction in your wallet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This may take a few moments...
                  </Typography>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Transfer Complete</StepLabel>
              <StepContent>
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Transfer Successful!
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    The NFT has been transferred to:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" paragraph>
                    {recipientAddress}
                  </Typography>
                  
                  {transactionHash && (
                    <Paper sx={{ p: 2, mt: 2, backgroundColor: 'background.default' }}>
                      <Typography variant="caption" color="text.secondary">
                        Transaction Hash:
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {transactionHash}
                      </Typography>
                    </Paper>
                  )}

                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/my-nfts')}
                      sx={{ mr: 2 }}
                    >
                      View My NFTs
                    </Button>
                    <Button variant="outlined" onClick={() => navigate('/gallery')}>
                      Browse Gallery
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NFTTransfer;