// SPDX-License-Identifier: GNU GENERAL PUBLIC LICENSE
pragma solidity ^0.8.27;

contract AllowPayment {
    uint256 public value = 0;
    uint256 public fallbacks = 0;
    uint256 public balance = 0;

    function testView() public pure returns (string memory) {
        return "view";
    }

    function testTransact() public {
        value++;
    }

    receive() external payable {
        balance += msg.value;
    }

    fallback() external payable {
        fallbacks++;
    }
}
