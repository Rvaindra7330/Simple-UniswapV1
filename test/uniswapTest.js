const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Uniswap Clone", function () {
  let TokenA, TokenB, Factory, Pair;
  let tokenA, tokenB, factory, pair;
  let owner, user1;

  beforeEach(async () => {
    [owner, user1] = await ethers.getSigners();

    // Deploy TokenA
    TokenA = await ethers.getContractFactory("TokenA");
    tokenA = await TokenA.deploy();
    await tokenA.waitForDeployment();

    // Deploy TokenB
    TokenB = await ethers.getContractFactory("TokenB");
    tokenB = await TokenB.deploy();
    await tokenB.waitForDeployment();

    // Deploy Factory
    Factory = await ethers.getContractFactory("Factory");
    factory = await Factory.deploy();
    await factory.waitForDeployment();
  });

  it("Should create a new pair only once", async function () {
    // Create a pair
    await expect(factory.createPair(await tokenA.getAddress(), await tokenB.getAddress()))
      .to.emit(factory, "PairCreated");

    const pairAddress = await factory.getPair(await tokenA.getAddress(), await tokenB.getAddress());
    expect(pairAddress).to.not.equal(ethers.ZeroAddress);

    // Trying to create the same pair again should revert
    await expect(factory.createPair(await tokenA.getAddress(), await tokenB.getAddress()))
      .to.be.revertedWith("Pair exists");
  });

  it("Should initialize pair correctly", async function () {
    await factory.createPair(await tokenA.getAddress(), await tokenB.getAddress());
    const pairAddress = await factory.getPair(await tokenA.getAddress(), await tokenB.getAddress());
    pair = await ethers.getContractAt("Pair", pairAddress);

    expect(await pair.tokenA()).to.equal(await tokenA.getAddress());
    expect(await pair.tokenB()).to.equal(await tokenB.getAddress());
  });

  it("Should allow adding liquidity and update reserves", async function () {
    await factory.createPair(await tokenA.getAddress(), await tokenB.getAddress());
    const pairAddress = await factory.getPair(await tokenA.getAddress(), await tokenB.getAddress());
    pair = await ethers.getContractAt("Pair", pairAddress);

    // Mint some tokens to user1
    await tokenA.transfer(user1.address, ethers.parseEther("100"));
    await tokenB.transfer(user1.address, ethers.parseEther("100"));

    // Approve pair contract
    await tokenA.connect(user1).approve(pairAddress, ethers.parseEther("50"));
    await tokenB.connect(user1).approve(pairAddress, ethers.parseEther("50"));

    // Add liquidity
    await pair.connect(user1).addLiquidity(ethers.parseEther("10"), ethers.parseEther("10"));

    expect(await pair.reserveA()).to.equal(ethers.parseEther("10"));
    expect(await pair.reserveB()).to.equal(ethers.parseEther("10"));
  });

  it("Should perform swaps correctly (TokenA -> TokenB)", async function () {
    await factory.createPair(await tokenA.getAddress(), await tokenB.getAddress());
    const pairAddress = await factory.getPair(await tokenA.getAddress(), await tokenB.getAddress());
    pair = await ethers.getContractAt("Pair", pairAddress);

    // Add liquidity
    await tokenA.transfer(user1.address, ethers.parseEther("100"));
    await tokenB.transfer(user1.address, ethers.parseEther("100"));

    await tokenA.connect(user1).approve(pairAddress, ethers.parseEther("50"));
    await tokenB.connect(user1).approve(pairAddress, ethers.parseEther("50"));
    await pair.connect(user1).addLiquidity(ethers.parseEther("20"), ethers.parseEther("20"));

    const reserveABefore = await pair.reserveA();
    const reserveBBefore = await pair.reserveB();

    // Approve swap input
    await tokenA.connect(user1).approve(pairAddress, ethers.parseEther("1"));

    // Execute swap
    await pair.connect(user1).swap(await tokenA.getAddress(), ethers.parseEther("1"));

    const reserveAAfter = await pair.reserveA();
    const reserveBAfter = await pair.reserveB();

    // Reserve A should increase, B should decrease
    expect(reserveAAfter).to.be.gt(reserveABefore);
    expect(reserveBAfter).to.be.lt(reserveBBefore);
  });

  it("Should not allow swapping invalid token", async function () {
    await factory.createPair(await tokenA.getAddress(), await tokenB.getAddress());
    const pairAddress = await factory.getPair(await tokenA.getAddress(), await tokenB.getAddress());
    pair = await ethers.getContractAt("Pair", pairAddress);

    const FakeToken = await ethers.getContractFactory("TokenA");
    const fakeToken = await FakeToken.deploy();
    await fakeToken.waitForDeployment();

    await expect(
      pair.swap(await fakeToken.getAddress(), ethers.parseEther("1"))
    ).to.be.revertedWith("Invalid token");
  });
});
