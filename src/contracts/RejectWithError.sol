// SPDX-License-Identifier: GNU GENERAL PUBLIC LICENSE
pragma solidity ^0.8.27;

contract RejectWithError {
    error ViewError();
    error TransactError();
    error ReceiveError();
    error FallbackError();

    uint256 private value = 0;

    function testView() public pure {
        revert ViewError();
    }

    function testTransact() public {
        value++;
        revert TransactError();
    }

    receive() external payable {
        revert ReceiveError();
    }

    fallback() external payable {
        revert FallbackError();
    }
}
