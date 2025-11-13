const { expect } =require("chai")
const { ethers } = require("hardhat")

describe("factory",function(){
    it("it should create a factory", async function(){
        const TokenA= await ethers.getContractFactory("TokenA")
        const TokenB = await ethers.getContractFactory("TokenB")
        const tokenA = await TokenA.deploy()
        const tokenB = await TokenB.deploy()
        
        const Factory = await ethers.getContractFactory("Factory")
        const factory = await Factory.deploy()

        await factory.createPair(tokenA.target,tokenB.target)
        const pairAddr = await factory.getPair(tokenA.target,tokenB.target)
        expect(pairAddr).to.not.equal(ethers.ZeroAddress)
    })
})