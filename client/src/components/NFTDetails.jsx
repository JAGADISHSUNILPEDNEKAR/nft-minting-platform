// src/components/NFTDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Paper,
  IconButton,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Link,
  Tooltip,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Share,
  Send,
  History,
  Description,
  LocalOffer,
  Verified,
  ContentCopy,
  OpenInNew,
  AccountCircle,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { fetchNFTDetails, clearSelectedNFT } from '../redux/slices/nftSlice';
import { IPFS_GATEWAY, CHAIN_CONFIG } from '../utils/constants';

const NFTDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { address } = useSelector((state) => state.wallet);
  const { selectedNFT, isLoading } = useSelector((state) => state.nft);
  
  const [tabValue, setTabValue] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    dispatch(fetchNFTDetails(id));
    
    return () => {
      dispatch(clearSelectedNFT());
    };
  }, [dispatch, id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: selectedNFT?.metadata?.name || 'NFT',
        text: selectedNFT?.metadata?.description || 'Check out this NFT!',
        url,
      });
    } else {
      copyToClipboard(url);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality with backend
  };

  const isOwner = selectedNFT?.currentOwner?.toLowerCase() === address?.toLowerCase();

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Skeleton variant="rectangular" height={500} />
        </Grid>
        <Grid item xs={12} md={7}>
          <Skeleton variant="text" height={60} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
        </Grid>
      </Grid>
    );
  }

  if (!selectedNFT) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6">NFT not found</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/gallery')}>
          Back to Gallery
        </Button>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Left Column - Image */}
      <Grid item xs={12} md={5}>
        <Card>
          <Box
            component="img"
            src={selectedNFT.metadata?.image || `${IPFS_GATEWAY}${selectedNFT.imageIpfsHash}`}
            alt={selectedNFT.metadata?.name}
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: '600px',
              objectFit: 'contain',
            }}
          />
        </Card>
        
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Attributes
          </Typography>
          <Grid container spacing={1}>
            {selectedNFT.metadata?.attributes?.length > 0 ? (
              selectedNFT.metadata.attributes.map((attr, index) => (
                <Grid item xs={6} key={index}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      backgroundColor: 'background.default',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {attr.trait_type}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {attr.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  No attributes
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>

      {/* Right Column - Details */}
      <Grid item xs={12} md={7}>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h4" component="h1">
              {selectedNFT.metadata?.name || `NFT #${selectedNFT.tokenId}`}
            </Typography>
            {selectedNFT.isVerified && (
              <Tooltip title="Verified Collection">
                <Verified color="primary" />
              </Tooltip>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip
              label={selectedNFT.category || 'Art'}
              color="primary"
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              Token ID: #{selectedNFT.tokenId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Views: {selectedNFT.stats?.views || 0}
            </Typography>
          </Box>

          <Typography variant="body1" paragraph>
            {selectedNFT.metadata?.description || 'No description available'}
          </Typography>
        </Box>

        {/* Owner Info */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Current Owner
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {selectedNFT.currentOwner?.slice(2, 4).toUpperCase()}
            </Avatar>
            <Typography variant="body1">
              {selectedNFT.currentOwner?.slice(0, 6)}...{selectedNFT.currentOwner?.slice(-4)}
            </Typography>
            <IconButton
              size="small"
              onClick={() => copyToClipboard(selectedNFT.currentOwner)}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {isOwner ? (
            <Button
              variant="contained"
              fullWidth
              startIcon={<Send />}
              onClick={() => navigate(`/transfer/${selectedNFT._id}`)}
            >
              Transfer NFT
            </Button>
          ) : (
            <Button variant="contained" fullWidth disabled>
              Not Available for Sale
            </Button>
          )}
          
          <IconButton
            onClick={toggleFavorite}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
          </IconButton>
          
          <IconButton
            onClick={handleShare}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Share />
          </IconButton>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Details" icon={<Description />} iconPosition="start" />
            <Tab label="History" icon={<History />} iconPosition="start" />
            <Tab label="Offers" icon={<LocalOffer />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ mt: 2 }}>
          {tabValue === 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Contract Address</TableCell>
                    <TableCell>
                      <Link
                        href={`${CHAIN_CONFIG[1337]?.explorerUrl}/address/${selectedNFT.contractAddress}`}
                        target="_blank"
                        rel="noopener"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        {selectedNFT.contractAddress?.slice(0, 6)}...
                        {selectedNFT.contractAddress?.slice(-4)}
                        <OpenInNew fontSize="small" />
                      </Link>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Token Standard</TableCell>
                    <TableCell>ERC-721</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Blockchain</TableCell>
                    <TableCell>Ethereum</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>IPFS Hash</TableCell>
                    <TableCell>
                      <Link
                        href={`${IPFS_GATEWAY}${selectedNFT.ipfsHash}`}
                        target="_blank"
                        rel="noopener"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        {selectedNFT.ipfsHash?.slice(0, 8)}...
                        <OpenInNew fontSize="small" />
                      </Link>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Created</TableCell>
                    <TableCell>
                      {new Date(selectedNFT.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tabValue === 1 && (
            <List>
              {selectedNFT.ownershipHistory?.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <AccountCircle />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {index === 0 ? 'Minted by' : 'Transferred to'}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {item.owner?.slice(0, 6)}...{item.owner?.slice(-4)}
                          </Typography>
                        </Box>
                      }
                      secondary={new Date(item.timestamp).toLocaleString()}
                    />
                    {item.transactionHash && (
                      <Link
                        href={`${CHAIN_CONFIG[1337]?.explorerUrl}/tx/${item.transactionHash}`}
                        target="_blank"
                        rel="noopener"
                      >
                        <IconButton size="small">
                          <OpenInNew fontSize="small" />
                        </IconButton>
                      </Link>
                    )}
                  </ListItem>
                  {index < selectedNFT.ownershipHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}

          {tabValue === 2 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No offers yet
              </Typography>
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default NFTDetails;

