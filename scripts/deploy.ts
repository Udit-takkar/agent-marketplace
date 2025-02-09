import { ethers } from "hardhat";

async function main() {
  const ScamDetector = await ethers.getContractFactory("ScamDetector");
  const scamDetector = await ScamDetector.deploy();
  await scamDetector.deployed();

  console.log("ScamDetector deployed to:", scamDetector.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
