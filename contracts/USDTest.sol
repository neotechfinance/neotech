// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDTest is ERC20 {
    constructor(uint256 initialSupply) ERC20("USDTest", "USDT") {
        _mint(msg.sender, initialSupply);
    }
}