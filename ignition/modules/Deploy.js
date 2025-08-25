const hre = require("hardhat");

async function main() {
  const TokenA = await hre.ethers.getContractFactory("TokenA");
  const tokenA = await TokenA.deploy();
  await tokenA.deployed();
  console.log("TokenA:", tokenA.address);

  const TokenB = await hre.ethers.getContractFactory("TokenB");
  const tokenB = await TokenB.deploy();
  await tokenB.deployed();
  console.log("TokenB:", tokenB.address);

  const Factory = await hre.ethers.getContractFactory("Factory");
  const factory = await Factory.deploy();
  await factory.deployed();
  console.log("Factory:", factory.address);

  // Create a Pair
  const tx = await factory.createPair(tokenA.address, tokenB.address);
  await tx.wait();

  const pairAddress = await factory.getPair(tokenA.address, tokenB.address);
  console.log("Pair Address:", pairAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
