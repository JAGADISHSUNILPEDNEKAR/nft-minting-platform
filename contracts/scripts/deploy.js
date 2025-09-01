// scripts/deploy.js
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying NFTMinting contract...");
  
  const NFTMinting = await hre.ethers.getContractFactory("NFTMinting");
  const nftMinting = await NFTMinting.deploy();
  
  await nftMinting.deployed();
  
  console.log("NFTMinting deployed to:", nftMinting.address);
  
  // Save the contract address to a file for frontend use
  const contractInfo = {
    address: nftMinting.address,
    abi: JSON.parse(nftMinting.interface.format('json'))
  };
  
  fs.writeFileSync(
    "./contract-info.json",
    JSON.stringify(contractInfo, null, 2)
  );
  
  console.log("Contract info saved to contract-info.json");
  
  // Verify on Etherscan if not on localhost
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await nftMinting.deployTransaction.wait(6);
    
    console.log("Verifying contract on Etherscan...");
    await hre.run("verify:verify", {
      address: nftMinting.address,
      constructorArguments: [],
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

