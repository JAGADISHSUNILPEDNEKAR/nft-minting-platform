// src/components/NFTMint.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  Add,
  Remove,
  CheckCircle,
  Error,
  Image as ImageIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { mintNFT } from '../redux/slices/nftSlice';
import ipfsService from '../services/ipfsService';
import apiService from '../services/apiService';
import { NFT_CATEGORIES, MAX_FILE_SIZE, MINT_PRICE } from '../utils/constants';

const NFTMint = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { signer } = useSelector((state) => state.wallet);
  const { isMinting } = useSelector((state) => state.nft);

  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'art',
    attributes: [{ trait_type: '', value: '' }],
  });
  const [imageHash, setImageHash] = useState(null);
  const [metadataHash, setMetadataHash] = useState(null);
  const [tokenId, setTokenId] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);

  const steps = ['Upload Image', 'Add Metadata', 'Mint NFT', 'Complete'];

  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error('File size must be less than 50MB');
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > MAX_FILE_SIZE) {
        toast.error('File size must be less than 50MB');
        return;
      }

      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(droppedFile);
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      attributes: newAttributes,
    }));
  };

  const addAttribute = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: '', value: '' }],
    }));
  };

  const removeAttribute = (index) => {
    const newAttributes = formData.attributes.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      attributes: newAttributes,
    }));
  };

  const uploadToIPFS = async () => {
    try {
      setUploadProgress(10);
      
      // Upload image to IPFS
      const imageResult = await ipfsService.uploadFile(file);
      setImageHash(imageResult.ipfsHash);
      setUploadProgress(50);

      // Create and upload metadata
      const metadataResult = await ipfsService.uploadNFTMetadata(
        formData.name,
        formData.description,
        imageResult.ipfsHash,
        formData.attributes.filter((attr) => attr.trait_type && attr.value)
      );
      setMetadataHash(metadataResult.ipfsHash);
      setUploadProgress(100);

      return metadataResult.ipfsHash;
    } catch (error) {
      console.error('IPFS upload error:', error);
      toast.error('Failed to upload to IPFS');
      throw error;
    }
  };

  const handleMint = async () => {
    if (!file || !formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setActiveStep(2);
      
      // Step 1: Upload to IPFS
      const metadataHash = await uploadToIPFS();
      const tokenURI = `ipfs://${metadataHash}`;

      // Step 2: Mint NFT on blockchain
      const result = await dispatch(
        mintNFT({ tokenURI, signer })
      ).unwrap();

      setTokenId(result.tokenId);
      setTransactionHash(result.transactionHash);

      // Step 3: Save to database
      await apiService.createNFT({
        tokenId: result.tokenId,
        contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
        metadata: {
          name: formData.name,
          description: formData.description,
          image: ipfsService.getIPFSUrl(imageHash),
          attributes: formData.attributes.filter(
            (attr) => attr.trait_type && attr.value
          ),
        },
        ipfsHash: metadataHash,
        imageIpfsHash: imageHash,
        transactionHash: result.transactionHash,
      });

      setActiveStep(3);
      toast.success('NFT minted successfully!');
    } catch (error) {
      console.error('Minting error:', error);
      toast.error('Failed to mint NFT');
      setActiveStep(1);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !file) {
      toast.error('Please select an image');
      return;
    }
    if (activeStep === 1 && (!formData.name || !formData.description)) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (activeStep === 1) {
      handleMint();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Paper
              sx={{
                p: 4,
                border: '2px dashed',
                borderColor: 'primary.main',
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: 'secondary.main',
                  backgroundColor: 'action.hover',
                },
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                id="file-input"
                type="file"
                hidden
                accept="image/*,video/mp4,audio/mpeg"
                onChange={handleFileSelect}
              />
              
              {preview ? (
                <Box>
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '400px',
                      borderRadius: '8px',
                    }}
                  />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                    }}
                  >
                    Change File
                  </Button>
                </Box>
              ) : (
                <Box>
                  <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Drop your file here or click to browse
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supports: Images, Videos (MP4), Audio (MP3)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Max size: 50MB
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={4}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    label="Category"
                  >
                    {NFT_CATEGORIES.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Attributes (Optional)
                </Typography>
                <List>
                  {formData.attributes.map((attr, index) => (
                    <ListItem key={index}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={5}>
                          <TextField
                            fullWidth
                            label="Property"
                            value={attr.trait_type}
                            onChange={(e) =>
                              handleAttributeChange(index, 'trait_type', e.target.value)
                            }
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={5}>
                          <TextField
                            fullWidth
                            label="Value"
                            value={attr.value}
                            onChange={(e) =>
                              handleAttributeChange(index, 'value', e.target.value)
                            }
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <IconButton
                            onClick={() => removeAttribute(index)}
                            disabled={formData.attributes.length === 1}
                          >
                            <Remove />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </ListItem>
                  ))}
                </List>
                <Button
                  startIcon={<Add />}
                  onClick={addAttribute}
                  variant="outlined"
                  size="small"
                >
                  Add Attribute
                </Button>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={64} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Minting your NFT...
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Please confirm the transaction in your wallet
            </Typography>
            {uploadProgress > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Uploading to IPFS: {uploadProgress}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{ mt: 1 }}
                />
              </Box>
            )}
            <Alert severity="info" sx={{ mt: 3, maxWidth: 400, mx: 'auto' }}>
              <Typography variant="body2">
                Minting cost: {MINT_PRICE} ETH + gas fees
              </Typography>
            </Alert>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
            <Typography variant="h4" gutterBottom>
              NFT Minted Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Your NFT has been minted and is now on the blockchain
            </Typography>
            
            <Paper sx={{ p: 3, mt: 3, maxWidth: 500, mx: 'auto' }}>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Token ID"
                    secondary={tokenId || 'Processing...'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Transaction Hash"
                    secondary={
                      transactionHash ? (
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {transactionHash}
                        </Typography>
                      ) : (
                        'Processing...'
                      )
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="IPFS Hash"
                    secondary={metadataHash || 'Processing...'}
                  />
                </ListItem>
              </List>
            </Paper>
            
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/my-nfts')}
                sx={{ mr: 2 }}
              >
                View My NFTs
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  setActiveStep(0);
                  setFile(null);
                  setPreview(null);
                  setFormData({
                    name: '',
                    description: '',
                    category: 'art',
                    attributes: [{ trait_type: '', value: '' }],
                  });
                  setImageHash(null);
                  setMetadataHash(null);
                  setTokenId(null);
                  setTransactionHash(null);
                  setUploadProgress(0);
                }}
              >
                Mint Another
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Mint Your NFT
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Card>
        <CardContent sx={{ p: 4 }}>
          {renderStepContent()}
          
          {activeStep < 2 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={isMinting}
              >
                {activeStep === 1 ? 'Mint NFT' : 'Next'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default NFTMint;