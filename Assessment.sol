// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//import "hardhat/console.sol";

contract Assessment {
    address payable public owner;
    uint256 public balance;
    // To keep track of the number of transactions
    uint256 public transactionCount; 

    enum TransactionType { Deposit, Withdrawal }

    struct Transaction {
        address sender;
        TransactionType transactionType;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(uint256 => Transaction) public transactionHistory;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);

        // Record the deposit transaction
        transactionCount++;
        transactionHistory[transactionCount] = Transaction(msg.sender, TransactionType.Deposit, _amount, block.timestamp);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);

        // Record the withdraw transaction
        transactionCount++;
        transactionHistory[transactionCount] = Transaction(msg.sender, TransactionType.Withdrawal, _withdrawAmount, block.timestamp);
    }

    // Get the entire transaction history
    function getTransactionHistory() public view returns (Transaction[] memory) {
        Transaction[] memory allTransactions = new Transaction[](transactionCount);
        for (uint256 i = 1; i <= transactionCount; i++) {
            allTransactions[i - 1] = transactionHistory[i];
        }
        return allTransactions;
    }
}
