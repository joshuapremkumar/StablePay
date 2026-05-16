// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StablePaySettlement is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Settlement {
        bytes32 id;
        address merchant;
        address token;
        uint256 amount;
        uint256 transactionCount;
        SettlementStatus status;
        uint256 createdAt;
        uint256 settledAt;
    }

    enum SettlementStatus { Pending, Processing, Completed, Failed }

    address public paymentContract;
    uint256 public settlementBatchId;

    mapping(bytes32 => Settlement) public settlements;
    mapping(address => uint256) public pendingSettlements;

    event SettlementCreated(bytes32 indexed settlementId, address indexed merchant, address token, uint256 amount);
    event SettlementCompleted(bytes32 indexed settlementId);
    event SettlementFailed(bytes32 indexed settlementId, string reason);

    constructor(address _paymentContract) Ownable(msg.sender) {
        paymentContract = _paymentContract;
    }

    function createSettlement(address merchant, address token, uint256 amount, uint256 txCount) external returns (bytes32) {
        require(msg.sender == paymentContract || msg.sender == owner(), "Not authorized");
        require(amount > 0, "Amount must be greater than 0");

        bytes32 settlementId = keccak256(abi.encodePacked(merchant, token, amount, block.timestamp, settlementBatchId++));

        settlements[settlementId] = Settlement({
            id: settlementId,
            merchant: merchant,
            token: token,
            amount: amount,
            transactionCount: txCount,
            status: SettlementStatus.Pending,
            createdAt: block.timestamp,
            settledAt: 0
        });

        pendingSettlements[merchant] += amount;
        emit SettlementCreated(settlementId, merchant, token, amount);
        return settlementId;
    }

    function completeSettlement(bytes32 settlementId) external onlyOwner nonReentrant {
        Settlement storage settlement = settlements[settlementId];
        require(settlement.status == SettlementStatus.Pending, "Invalid status");

        settlement.status = SettlementStatus.Completed;
        settlement.settledAt = block.timestamp;
        pendingSettlements[settlement.merchant] -= settlement.amount;

        emit SettlementCompleted(settlementId);
    }

    function getSettlement(bytes32 settlementId) external view returns (Settlement memory) {
        return settlements[settlementId];
    }
}
