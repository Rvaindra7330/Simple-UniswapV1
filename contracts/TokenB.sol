// contracts/Token.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenA is ERC20 {
    constructor() ERC20("BRP", "BRADPIT") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
