// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StablePayEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Escrow {
        bytes32 id;
        address buyer;
        address seller;
        address token;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 milestoneCount;
        uint256 completedMilestones;
        EscrowStatus status;
        uint256 createdAt;
        uint256 expiresAt;
    }

    struct Milestone {
        bytes32 escrowId;
        uint256 index;
        string description;
        uint256 amount;
        bool completed;
        uint256 completedAt;
    }

    enum EscrowStatus { Pending, Active, Completed, Disputed, Cancelled }

    uint256 public escrowCounter;
    mapping(bytes32 => Escrow) public escrows;
    mapping(bytes32 => Milestone[]) public milestones;

    event EscrowCreated(bytes32 indexed escrowId, address indexed buyer, address indexed seller, uint256 amount);
    event MilestoneCompleted(bytes32 indexed escrowId, uint256 milestoneIndex, uint256 amount);
    event EscrowCompleted(bytes32 indexed escrowId);
    event EscrowDisputed(bytes32 indexed escrowId);
    event EscrowReleased(bytes32 indexed escrowId, address indexed party, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function createEscrow(
        address seller,
        address token,
        uint256 totalAmount,
        uint256[] calldata milestoneAmounts,
        string[] calldata milestoneDescriptions,
        uint256 expiryDays
    ) external payable returns (bytes32) {
        require(seller != address(0), "Invalid seller");
        require(totalAmount > 0, "Amount must be > 0");
        require(milestoneAmounts.length == milestoneDescriptions.length, "Array mismatch");
        require(milestoneAmounts.length > 0, "At least 1 milestone");

        uint256 sum;
        for (uint i = 0; i < milestoneAmounts.length; i++) {
            sum += milestoneAmounts[i];
        }
        require(sum == totalAmount, "Milestone sums must equal total");

        bytes32 escrowId = keccak256(abi.encodePacked(msg.sender, seller, token, block.timestamp, escrowCounter++));

        IERC20(token).safeTransferFrom(msg.sender, address(this), totalAmount);

        escrows[escrowId] = Escrow({
            id: escrowId,
            buyer: msg.sender,
            seller: seller,
            token: token,
            totalAmount: totalAmount,
            releasedAmount: 0,
            milestoneCount: milestoneAmounts.length,
            completedMilestones: 0,
            status: EscrowStatus.Active,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + (expiryDays * 1 days)
        });

        for (uint i = 0; i < milestoneAmounts.length; i++) {
            milestones[escrowId].push(Milestone({
                escrowId: escrowId,
                index: i,
                description: milestoneDescriptions[i],
                amount: milestoneAmounts[i],
                completed: false,
                completedAt: 0
            }));
        }

        emit EscrowCreated(escrowId, msg.sender, seller, totalAmount);
        return escrowId;
    }

    function completeMilestone(bytes32 escrowId, uint256 milestoneIndex) external {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(msg.sender == escrow.buyer || msg.sender == escrow.seller || msg.sender == owner(), "Not authorized");
        require(milestoneIndex < escrow.milestoneCount, "Invalid milestone");

        Milestone storage milestone = milestones[escrowId][milestoneIndex];
        require(!milestone.completed, "Already completed");

        milestone.completed = true;
        milestone.completedAt = block.timestamp;
        escrow.completedMilestones++;
        escrow.releasedAmount += milestone.amount;

        IERC20(escrow.token).safeTransfer(escrow.seller, milestone.amount);

        emit MilestoneCompleted(escrowId, milestoneIndex, milestone.amount);

        if (escrow.completedMilestones == escrow.milestoneCount) {
            escrow.status = EscrowStatus.Completed;
            emit EscrowCompleted(escrowId);
        }
    }
}
