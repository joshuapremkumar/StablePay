// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StablePayLetterOfCredit is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct LetterOfCredit {
        bytes32 id;
        address applicant;
        address beneficiary;
        address token;
        uint256 amount;
        uint256 expiryDate;
        LoCStatus status;
        uint256 createdAt;
        uint256 releasedAt;
    }

    enum LoCStatus { Issued, Active, Released, Expired, Cancelled }

    uint256 public locCounter;
    mapping(bytes32 => LetterOfCredit) public lettersOfCredit;

    event LoCIssued(bytes32 indexed locId, address indexed applicant, address indexed beneficiary, uint256 amount);
    event LoCReleased(bytes32 indexed locId, uint256 releasedAmount);
    event LoCCancelled(bytes32 indexed locId);

    constructor() Ownable(msg.sender) {}

    function issueLetterOfCredit(
        address beneficiary,
        address token,
        uint256 amount,
        uint256 expiryDays
    ) external payable returns (bytes32) {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be greater than 0");
        require(expiryDays > 0 && expiryDays <= 365, "Invalid expiry");

        bytes32 locId = keccak256(abi.encodePacked(msg.sender, beneficiary, token, amount, block.timestamp, locCounter++));

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        lettersOfCredit[locId] = LetterOfCredit({
            id: locId,
            applicant: msg.sender,
            beneficiary: beneficiary,
            token: token,
            amount: amount,
            expiryDate: block.timestamp + (expiryDays * 1 days),
            status: LoCStatus.Issued,
            createdAt: block.timestamp,
            releasedAt: 0
        });

        emit LoCIssued(locId, msg.sender, beneficiary, amount);
        return locId;
    }

    function releasePayment(bytes32 locId) external nonReentrant {
        LetterOfCredit storage loc = lettersOfCredit[locId];
        require(loc.status == LoCStatus.Issued || loc.status == LoCStatus.Active, "Invalid status");
        require(msg.sender == loc.beneficiary || msg.sender == owner(), "Not authorized");
        require(block.timestamp <= loc.expiryDate, "LoC expired");

        loc.status = LoCStatus.Released;
        loc.releasedAt = block.timestamp;

        IERC20(loc.token).safeTransfer(loc.beneficiary, loc.amount);

        emit LoCReleased(locId, loc.amount);
    }

    function cancelLetterOfCredit(bytes32 locId) external {
        LetterOfCredit storage loc = lettersOfCredit[locId];
        require(loc.status == LoCStatus.Issued, "Cannot cancel");
        require(msg.sender == loc.applicant || msg.sender == owner(), "Not authorized");

        loc.status = LoCStatus.Cancelled;

        IERC20(loc.token).safeTransfer(loc.applicant, loc.amount);

        emit LoCCancelled(locId);
    }

    function expireLetterOfCredit(bytes32 locId) external onlyOwner {
        LetterOfCredit storage loc = lettersOfCredit[locId];
        require(loc.status == LoCStatus.Issued, "Invalid status");
        require(block.timestamp > loc.expiryDate, "Not yet expired");

        loc.status = LoCStatus.Expired;
        IERC20(loc.token).safeTransfer(loc.applicant, loc.amount);
    }
}
