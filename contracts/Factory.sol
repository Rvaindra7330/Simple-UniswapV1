// contracts/Factory.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Pair.sol";

contract Factory {
    mapping(address => mapping(address => address)) public getPair;

    event PairCreated(address tokenA, address tokenB, address pair);

    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, "Identical tokens");
        require(getPair[tokenA][tokenB] == address(0), "Pair exists");

        bytes memory bytecode = type(Pair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(tokenA, tokenB));

        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        Pair(pair).initialize(tokenA, tokenB);
        getPair[tokenA][tokenB] = pair;
        getPair[tokenB][tokenA] = pair;

        emit PairCreated(tokenA, tokenB, pair);
    }
}
