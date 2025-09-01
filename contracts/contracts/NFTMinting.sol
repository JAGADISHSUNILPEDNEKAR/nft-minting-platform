// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMinting is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    uint256 public mintPrice = 0.01 ether;
    uint256 public maxSupply = 10000;
    bool public pausedMint = false;
    
    mapping(uint256 => address[]) private _ownershipHistory;
    mapping(address => uint256[]) private _userMintedTokens;
    
    event NFTMinted(address indexed minter, uint256 indexed tokenId, string tokenURI);
    event NFTTransferred(address indexed from, address indexed to, uint256 indexed tokenId);
    event MintPaused(bool status);
    event PriceUpdated(uint256 newPrice);
    
    constructor() ERC721("NFT Platform", "NFTP") {}
    
    modifier mintNotPaused() {
        require(!pausedMint, "Minting is currently paused");
        _;
    }
    
    function mintNFT(string memory tokenURI) public payable mintNotPaused nonReentrant returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_tokenIdCounter.current() < maxSupply, "Max supply reached");
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        _ownershipHistory[tokenId].push(msg.sender);
        _userMintedTokens[msg.sender].push(tokenId);
        
        emit NFTMinted(msg.sender, tokenId, tokenURI);
        
        // Refund excess payment
        if (msg.value > mintPrice) {
            payable(msg.sender).transfer(msg.value - mintPrice);
        }
        
        return tokenId;
    }
    
    function batchMintNFT(string[] memory tokenURIs) public payable mintNotPaused nonReentrant returns (uint256[] memory) {
        require(tokenURIs.length > 0, "No URIs provided");
        require(tokenURIs.length <= 10, "Cannot mint more than 10 at once");
        require(msg.value >= mintPrice * tokenURIs.length, "Insufficient payment");
        require(_tokenIdCounter.current() + tokenURIs.length <= maxSupply, "Would exceed max supply");
        
        uint256[] memory tokenIds = new uint256[](tokenURIs.length);
        
        for (uint256 i = 0; i < tokenURIs.length; i++) {
            require(bytes(tokenURIs[i]).length > 0, "Token URI cannot be empty");
            
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            
            _safeMint(msg.sender, tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            
            _ownershipHistory[tokenId].push(msg.sender);
            _userMintedTokens[msg.sender].push(tokenId);
            
            tokenIds[i] = tokenId;
            
            emit NFTMinted(msg.sender, tokenId, tokenURIs[i]);
        }
        
        // Refund excess payment
        uint256 totalCost = mintPrice * tokenURIs.length;
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        return tokenIds;
    }
    
    function transferNFT(address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner or approved");
        require(to != address(0), "Cannot transfer to zero address");
        
        address from = ownerOf(tokenId);
        _transfer(from, to, tokenId);
        
        _ownershipHistory[tokenId].push(to);
        
        emit NFTTransferred(from, to, tokenId);
    }
    
    function getOwnershipHistory(uint256 tokenId) public view returns (address[] memory) {
        require(_exists(tokenId), "Token does not exist");
        return _ownershipHistory[tokenId];
    }
    
    function getUserMintedTokens(address user) public view returns (uint256[] memory) {
        return _userMintedTokens[user];
    }
    
    function getUserOwnedTokens(address user) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tokens = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokens[i] = tokenOfOwnerByIndex(user, i);
        }
        
        return tokens;
    }
    
    function updateMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
        emit PriceUpdated(newPrice);
    }
    
    function pauseMinting(bool _pause) public onlyOwner {
        pausedMint = _pause;
        emit MintPaused(_pause);
    }
    
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        if (from != address(0) && to != address(0)) {
            _ownershipHistory[tokenId].push(to);
        }
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function totalSupply() public view override returns (uint256) {
        return _tokenIdCounter.current();
    }
}