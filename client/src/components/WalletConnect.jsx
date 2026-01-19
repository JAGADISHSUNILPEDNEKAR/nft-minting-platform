// src/components/WalletConnect.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Check,
  Warning,
  Security,
  Speed,
  Layers,
} from '@mui/icons-material';
import { connectWallet } from '../redux/slices/walletSlice';

const WalletConnect = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { address, isConnecting, error } = useSelector((state) => state.wallet);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'Install MetaMask',
      description: 'Make sure you have MetaMask extension installed in your browser.',
    },
    {
      label: 'Connect Wallet',
      description: 'Click the connect button to link your wallet with our platform.',
    },
    {
      label: 'Sign Message',
      description: 'Sign a message to verify ownership of your wallet address.',
    },
  ];

  const features = [
    {
      icon: <Security />,
      title: 'Secure',
      description: 'Your private keys never leave your wallet',
    },
    {
      icon: <Speed />,
      title: 'Fast',
      description: 'Instant connection and transactions',
    },
    {
      icon: <Layers />,
      title: 'Multi-chain',
      description: 'Support for Ethereum and Polygon networks',
    },
  ];

  const handleConnect = async () => {
    setActiveStep(1);
    try {
      await dispatch(connectWallet()).unwrap();
      setActiveStep(3);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Connection failed:', error);
      setActiveStep(0);
    }
  };

  if (address) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <Card sx={{ maxWidth: 600, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Check sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Wallet Connected!
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {address}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/')}
                sx={{ mr: 2 }}
              >
                Go to Gallery
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/mint')}
              >
                Mint NFT
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Connect Your Wallet
      </Typography>

      <Typography
        variant="h6"
        align="center"
        color="text.secondary"
        sx={{ mb: 6 }}
      >
        Connect your MetaMask wallet to start minting and trading NFTs
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 6 }}>
        {features.map((feature) => (
          <Card
            key={feature.title}
            sx={{
              flex: '1 1 300px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
              <Typography variant="h6" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
                <StepContent>
                  <Typography>{step.description}</Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            {!window.ethereum ? (
              <>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    MetaMask is not installed. Please install it to continue.
                  </Typography>
                </Alert>
                <Button
                  variant="contained"
                  size="large"
                  href="https://metamask.io/download/"
                  target="_blank"
                  startIcon={<AccountBalanceWallet />}
                >
                  Install MetaMask
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                size="large"
                onClick={handleConnect}
                disabled={isConnecting}
                startIcon={
                  isConnecting ? (
                    <CircularProgress size={20} />
                  ) : (
                    <AccountBalanceWallet />
                  )
                }
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default WalletConnect;