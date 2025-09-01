// test/NFTMinting.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMinting", function () {
  let nftMinting;
  let owner;
  let addr1;
  let addr2;
  
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const NFTMinting = await ethers.getContractFactory("NFTMinting");
    nftMinting = await NFTMinting.deploy();
    await nftMinting.deployed();
  });
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nftMinting.owner()).to.equal(owner.address);
    });
    
    it("Should have correct name and symbol", async function () {
      expect(await nftMinting.name()).to.equal("NFT Platform");
      expect(await nftMinting.symbol()).to.equal("NFTP");
    });
  });
  
  describe("Minting", function () {
    it("Should mint a new NFT", async function () {
      const tokenURI = "ipfs://QmTest123";
      const mintPrice = await nftMinting.mintPrice();
      
      await expect(
        nftMinting.connect(addr1).mintNFT(tokenURI, { value: mintPrice })
      )
        .to.emit(nftMinting, "NFTMinted")
        .withArgs(addr1.address, 0, tokenURI);
      
      expect(await nftMinting.ownerOf(0)).to.equal(addr1.address);
      expect(await nftMinting.tokenURI(0)).to.equal(tokenURI);
    });
    
    it("Should fail if insufficient payment", async function () {
      const tokenURI = "ipfs://QmTest123";
      
      await expect(
        nftMinting.connect(addr1).mintNFT(tokenURI, { value: 0 })
      ).to.be.revertedWith("Insufficient payment");
    });
    
    it("Should batch mint NFTs", async function () {
      const tokenURIs = [
        "ipfs://QmTest1",
        "ipfs://QmTest2",
        "ipfs://QmTest3"
      ];
      const mintPrice = await nftMinting.mintPrice();
      const totalPrice = mintPrice.mul(tokenURIs.length);
      
      const tx = await nftMinting.connect(addr1).batchMintNFT(tokenURIs, { 
        value: totalPrice 
      });
      
      const receipt = await tx.wait();
      const events = receipt.events.filter(e => e.event === "NFTMinted");
      
      expect(events.length).to.equal(3);
      expect(await nftMinting.balanceOf(addr1.address)).to.equal(3);
    });
  });
  
  describe("Transfer", function () {
    beforeEach(async function () {
      const tokenURI = "ipfs://QmTest123";
      const mintPrice = await nftMinting.mintPrice();
      await nftMinting.connect(addr1).mintNFT(tokenURI, { value: mintPrice });
    });
    
    it("Should transfer NFT", async function () {
      await expect(
        nftMinting.connect(addr1).transferNFT(addr2.address, 0)
      )
        .to.emit(nftMinting, "NFTTransferred")
        .withArgs(addr1.address, addr2.address, 0);
      
      expect(await nftMinting.ownerOf(0)).to.equal(addr2.address);
    });
    
    it("Should track ownership history", async function () {
      await nftMinting.connect(addr1).transferNFT(addr2.address, 0);
      
      const history = await nftMinting.getOwnershipHistory(0);
      expect(history[0]).to.equal(addr1.address);
      expect(history[1]).to.equal(addr2.address);
    });
  });
  
  describe("Admin Functions", function () {
    it("Should update mint price", async function () {
      const newPrice = ethers.utils.parseEther("0.02");
      
      await expect(nftMinting.updateMintPrice(newPrice))
        .to.emit(nftMinting, "PriceUpdated")
        .withArgs(newPrice);
      
      expect(await nftMinting.mintPrice()).to.equal(newPrice);
    });
    
    it("Should pause minting", async function () {
      await nftMinting.pauseMinting(true);
      
      const tokenURI = "ipfs://QmTest123";
      const mintPrice = await nftMinting.mintPrice();
      
      await expect(
        nftMinting.connect(addr1).mintNFT(tokenURI, { value: mintPrice })
      ).to.be.revertedWith("Minting is currently paused");
    });
    
    it("Should withdraw funds", async function () {
      const tokenURI = "ipfs://QmTest123";
      const mintPrice = await nftMinting.mintPrice();
      
      await nftMinting.connect(addr1).mintNFT(tokenURI, { value: mintPrice });
      
      const initialBalance = await owner.getBalance();
      const tx = await nftMinting.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      
      const finalBalance = await owner.getBalance();
      expect(finalBalance).to.equal(initialBalance.add(mintPrice).sub(gasUsed));
    });
  });
});