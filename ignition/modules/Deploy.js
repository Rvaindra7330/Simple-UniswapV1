const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("UniswapCloneModule", (m) => {

  const tokenA = m.contract("TokenA");
  const tokenB = m.contract("TokenB");

  const factory = m.contract("Factory");

  // create a pair using call()
  m.call(factory, "createPair", [tokenA, tokenB]);

  return { tokenA, tokenB, factory };
});
