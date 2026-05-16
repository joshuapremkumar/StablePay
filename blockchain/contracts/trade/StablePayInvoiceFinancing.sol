// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StablePayInvoiceFinancing is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Financing {
        bytes32 id;
        address borrower;
        address lender;
        address token;
        uint256 invoiceAmount;
        uint256 fundingAmount;
        uint256 interestRate; // basis points
        uint256 maturityDate;
        FinancingStatus status;
        uint256 createdAt;
        uint256 repaidAt;
    }

    enum FinancingStatus { Pending, Funded, Repaid, Defaulted }

    uint256 public financingCounter;
    uint256 public totalFunded;
    mapping(bytes32 => Financing) public financings;

    event FinancingCreated(bytes32 indexed id, address indexed borrower, uint256 fundingAmount);
    event FinancingFunded(bytes32 indexed id, address indexed lender);
    event FinancingRepaid(bytes32 indexed id, uint256 repaymentAmount);
    event FinancingDefaulted(bytes32 indexed id);

    constructor() Ownable(msg.sender) {}

    function requestFinancing(
        address token,
        uint256 invoiceAmount,
        uint256 fundingAmount,
        uint256 interestRate,
        uint256 maturityDays
    ) external returns (bytes32) {
        require(fundingAmount > 0 && fundingAmount <= invoiceAmount, "Invalid amounts");
        require(interestRate > 0, "Interest rate required");

        bytes32 finId = keccak256(abi.encodePacked(msg.sender, token, invoiceAmount, block.timestamp, financingCounter++));

        financings[finId] = Financing({
            id: finId,
            borrower: msg.sender,
            lender: address(0),
            token: token,
            invoiceAmount: invoiceAmount,
            fundingAmount: fundingAmount,
            interestRate: interestRate,
            maturityDate: block.timestamp + (maturityDays * 1 days),
            status: FinancingStatus.Pending,
            createdAt: block.timestamp,
            repaidAt: 0
        });

        emit FinancingCreated(finId, msg.sender, fundingAmount);
        return finId;
    }

    function fundFinancing(bytes32 finId) external nonReentrant {
        Financing storage fin = financings[finId];
        require(fin.status == FinancingStatus.Pending, "Not pending");
        require(fin.lender == address(0), "Already funded");

        fin.lender = msg.sender;
        fin.status = FinancingStatus.Funded;

        IERC20(fin.token).safeTransferFrom(msg.sender, fin.borrower, fin.fundingAmount);
        totalFunded += fin.fundingAmount;

        emit FinancingFunded(finId, msg.sender);
    }

    function repayFinancing(bytes32 finId) external nonReentrant {
        Financing storage fin = financings[finId];
        require(fin.status == FinancingStatus.Funded, "Not funded");
        require(msg.sender == fin.borrower, "Not borrower");
        require(block.timestamp <= fin.maturityDate, "Past maturity");

        uint256 repaymentAmount = fin.fundingAmount + (fin.fundingAmount * fin.interestRate / 10000);

        fin.status = FinancingStatus.Repaid;
        fin.repaidAt = block.timestamp;

        IERC20(fin.token).safeTransferFrom(msg.sender, fin.lender, repaymentAmount);

        emit FinancingRepaid(finId, repaymentAmount);
    }

    function declareDefault(bytes32 finId) external onlyOwner {
        Financing storage fin = financings[finId];
        require(fin.status == FinancingStatus.Funded, "Not funded");
        require(block.timestamp > fin.maturityDate, "Not yet mature");

        fin.status = FinancingStatus.Defaulted;
        emit FinancingDefaulted(finId);
    }
}
