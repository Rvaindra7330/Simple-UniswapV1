const hre = require("hardhat");

async function main() {
  const TokenA = await hre.ethers.getContractFactory("TokenA");
  const tokenA = await TokenA.deploy();
  await tokenA.waitForDeployment();
  console.log("TokenA:", tokenA.target);

  const TokenB = await hre.ethers.getContractFactory("TokenB");
  const tokenB = await TokenB.deploy();
  await tokenB.waitForDeployment();
  console.log("TokenB:", tokenB.target);

  const Factory = await hre.ethers.getContractFactory("Factory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  console.log("Factory:", factory.target);

  // Create a Pair
  const tx = await factory.createPair(tokenA.target, tokenB.target);
  await tx.wait();

  const pairAddress = await factory.getPair(tokenA.target, tokenB.target);
  console.log("Pair Address:", pairAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
