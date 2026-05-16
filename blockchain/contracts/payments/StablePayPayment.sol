// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract StablePayPayment is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    struct Payment {
        bytes32 id;
        address payer;
        address payee;
        address token;
        uint256 amount;
        uint256 fee;
        PaymentStatus status;
        uint256 createdAt;
        uint256 settledAt;
    }

    enum PaymentStatus { Pending, Completed, Refunded, Cancelled }

    uint256 public constant FEE_BASIS_POINTS = 30; // 0.3% fee
    address public feeCollector;
    uint256 public totalVolume;
    uint256 public totalTransactions;

    mapping(bytes32 => Payment) public payments;
    mapping(address => uint256) public merchantVolume;
    mapping(address => bool) public supportedTokens;

    event PaymentCreated(bytes32 indexed paymentId, address indexed payer, address indexed payee, address token, uint256 amount);
    event PaymentCompleted(bytes32 indexed paymentId, uint256 fee);
    event PaymentRefunded(bytes32 indexed paymentId);
    event FeeCollectorUpdated(address indexed newCollector);
    event TokenSupportUpdated(address indexed token, bool supported);

    constructor(address _feeCollector) Ownable(msg.sender) {
        require(_feeCollector != address(0), "Invalid fee collector");
        feeCollector = _feeCollector;
    }

    function setFeeCollector(address _feeCollector) external onlyOwner {
        require(_feeCollector != address(0), "Invalid address");
        feeCollector = _feeCollector;
        emit FeeCollectorUpdated(_feeCollector);
    }

    function setTokenSupport(address token, bool supported) external onlyOwner {
        supportedTokens[token] = supported;
        emit TokenSupportUpdated(token, supported);
    }

    function createPayment(address payee, address token, uint256 amount) external whenNotPaused returns (bytes32) {
        require(payee != address(0), "Invalid payee");
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");

        bytes32 paymentId = keccak256(abi.encodePacked(msg.sender, payee, token, amount, block.timestamp));
        require(payments[paymentId].createdAt == 0, "Payment already exists");

        uint256 fee = (amount * FEE_BASIS_POINTS) / 10000;
        uint256 netAmount = amount - fee;

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        payments[paymentId] = Payment({
            id: paymentId,
            payer: msg.sender,
            payee: payee,
            token: token,
            amount: amount,
            fee: fee,
            status: PaymentStatus.Pending,
            createdAt: block.timestamp,
            settledAt: 0
        });

        emit PaymentCreated(paymentId, msg.sender, payee, token, amount);
        return paymentId;
    }

    function completePayment(bytes32 paymentId) external nonReentrant whenNotPaused {
        Payment storage payment = payments[paymentId];
        require(payment.status == PaymentStatus.Pending, "Invalid payment status");
        require(msg.sender == payment.payer || msg.sender == owner(), "Not authorized");

        payment.status = PaymentStatus.Completed;
        payment.settledAt = block.timestamp;

        IERC20(payment.token).safeTransfer(payment.payee, payment.amount - payment.fee);
        IERC20(payment.token).safeTransfer(feeCollector, payment.fee);

        totalVolume += payment.amount;
        totalTransactions++;
        merchantVolume[payment.payee] += payment.amount;

        emit PaymentCompleted(paymentId, payment.fee);
    }

    function refundPayment(bytes32 paymentId) external nonReentrant {
        Payment storage payment = payments[paymentId];
        require(payment.status == PaymentStatus.Pending, "Cannot refund");
        require(msg.sender == payment.payer || msg.sender == owner(), "Not authorized");

        payment.status = PaymentStatus.Refunded;
        payment.settledAt = block.timestamp;

        IERC20(payment.token).safeTransfer(payment.payer, payment.amount);

        emit PaymentRefunded(paymentId);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function getPayment(bytes32 paymentId) external view returns (Payment memory) {
        return payments[paymentId];
    }
}
