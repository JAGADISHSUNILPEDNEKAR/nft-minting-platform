// src/components/NFTGallery.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Skeleton,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Search,
  GridView,
  ViewList,
  Favorite,
  FavoriteBorder,
  Visibility,
  Share,
} from '@mui/icons-material';
import { fetchNFTs, fetchUserNFTs } from '../redux/slices/nftSlice';
import { NFT_CATEGORIES, IPFS_GATEWAY } from '../utils/constants';

const NFTGallery = ({ userOnly = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { address } = useSelector((state) => state.wallet);
  const { nfts, userNFTs, isLoading, totalPages, currentPage } = useSelector(
    (state) => state.nft
  );
  
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (userOnly && address) {
      dispatch(fetchUserNFTs(address));
    } else if (!userOnly) {
      dispatch(
        fetchNFTs({
          page,
          limit: 20,
          category: category || undefined,
          search: searchTerm || undefined,
          sort: sortBy,
        })
      );
    }
  }, [dispatch, page, category, searchTerm, sortBy, userOnly, address]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
      dispatch(
        fetchNFTs({
          page: 1,
          category,
          search: searchTerm,
          sort: sortBy,
        })
      );
    }
  };

  const toggleFavorite = (nftId) => {
    setFavorites((prev) =>
      prev.includes(nftId)
        ? prev.filter((id) => id !== nftId)
        : [...prev, nftId]
    );
  };

  const displayNFTs = userOnly ? userNFTs : nfts;

  const NFTCard = ({ nft }) => {
    const isFavorite = favorites.includes(nft._id);
    
    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: 6,
          },
        }}
      >
        <CardMedia
          component="img"
          height={viewMode === 'grid' ? 250 : 150}
          image={nft.metadata?.image || `${IPFS_GATEWAY}${nft.imageIpfsHash}`}
          alt={nft.metadata?.name}
          onClick={() => navigate(`/nft/${nft._id}`)}
          sx={{
            objectFit: 'cover',
            backgroundColor: 'grey.800',
          }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="h2" noWrap>
            {nft.metadata?.name || `NFT #${nft.tokenId}`}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {nft.metadata?.description || 'No description available'}
          </Typography>
          
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24 }}>
              {nft.creator?.walletAddress?.slice(2, 4).toUpperCase()}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {nft.creator?.username ||
                `${nft.creator?.walletAddress?.slice(0, 6)}...${nft.creator?.walletAddress?.slice(-4)}`}
            </Typography>
          </Box>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Chip
              label={nft.category || 'Art'}
              size="small"
              color="primary"
              variant="outlined"
            />
            {nft.isVerified && (
              <Chip label="Verified" size="small" color="success" />
            )}
          </Box>
        </CardContent>
        
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(nft._id);
              }}
            >
              {isFavorite ? (
                <Favorite color="error" />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              {nft.stats?.likes || 0}
            </Typography>
            
            <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
              <Visibility fontSize="small" />
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {nft.stats?.views || 0}
              </Typography>
            </Box>
            
            <Box sx={{ ml: 'auto' }}>
              <Button
                size="small"
                variant="contained"
                onClick={() => navigate(`/nft/${nft._id}`)}
              >
                View
              </Button>
            </Box>
          </Box>
        </CardActions>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {userOnly ? 'My NFTs' : 'NFT Gallery'}
      </Typography>
      
      {!userOnly && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search NFTs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  label="Category"
                >
                  <MenuItem value="">All</MenuItem>
                  {NFT_CATEGORIES.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  label="Sort By"
                >
                  <MenuItem value="-createdAt">Newest First</MenuItem>
                  <MenuItem value="createdAt">Oldest First</MenuItem>
                  <MenuItem value="-stats.views">Most Viewed</MenuItem>
                  <MenuItem value="-stats.likes">Most Liked</MenuItem>
                  <MenuItem value="metadata.name">Name (A-Z)</MenuItem>
                  <MenuItem value="-metadata.name">Name (Z-A)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
                fullWidth
              >
                <ToggleButton value="grid">
                  <GridView />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewList />
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {isLoading ? (
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={250} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={60} />
                  <Skeleton variant="text" width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : displayNFTs.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {displayNFTs.map((nft) => (
              <Grid
                item
                xs={12}
                sm={viewMode === 'list' ? 12 : 6}
                md={viewMode === 'list' ? 12 : 4}
                lg={viewMode === 'list' ? 12 : 3}
                key={nft._id}
              >
                <NFTCard nft={nft} />
              </Grid>
            ))}
          </Grid>
          
          {!userOnly && totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {userOnly
              ? "You don't have any NFTs yet"
              : 'No NFTs found'}
          </Typography>
          {userOnly && (
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate('/mint')}
            >
              Mint Your First NFT
            </Button>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default NFTGallery;