// contracts/Pair.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Pair {
    address public tokenA;
    address public tokenB;

    uint public reserveA;
    uint public reserveB;

    function initialize(address _tokenA, address _tokenB) external {
        require(tokenA == address(0) && tokenB == address(0), "Already initialized");
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    function addLiquidity(uint amountA, uint amountB) external {
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountB);

        reserveA += amountA;
        reserveB += amountB;
    }

    function swap(address fromToken, uint amountIn) external {
        require(fromToken == tokenA || fromToken == tokenB, "Invalid token");

        address toToken = fromToken == tokenA ? tokenB : tokenA;
        (uint reserveIn, uint reserveOut) = fromToken == tokenA
            ? (reserveA, reserveB)
            : (reserveB, reserveA);

        uint amountInWithFee = (amountIn * 997) / 1000;
        uint amountOut = (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee);

        IERC20(fromToken).transferFrom(msg.sender, address(this), amountIn);
        IERC20(toToken).transfer(msg.sender, amountOut);

        if (fromToken == tokenA) {
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            reserveB += amountIn;
            reserveA -= amountOut;
        }
    }
}
