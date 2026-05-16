import { expect } from "chai";
import { ethers } from "hardhat";

describe("StablePayPayment", function () {
  let payment: any;
  let token: any;
  let owner: any;
  let merchant: any;
  let customer: any;

  beforeEach(async function () {
    [owner, merchant, customer] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("StablePayToken");
    token = await Token.deploy("USD Coin", "USDC", 6, ethers.parseUnits("1000000", 6));
    await token.waitForDeployment();

    const Payment = await ethers.getContractFactory("StablePayPayment");
    payment = await Payment.deploy(owner.address);
    await payment.waitForDeployment();

    await token.connect(owner).transfer(customer.address, ethers.parseUnits("10000", 6));
    await token.connect(customer).approve(await payment.getAddress(), ethers.parseUnits("10000", 6));
    await payment.connect(owner).setTokenSupport(await token.getAddress(), true);
  });

  it("should create a payment", async function () {
    const tx = await payment.connect(customer).createPayment(
      merchant.address,
      await token.getAddress(),
      ethers.parseUnits("1000", 6)
    );
    const receipt = await tx.wait();
    expect(receipt.status).to.equal(1);
  });

  it("should complete a payment", async function () {
    const tx = await payment.connect(customer).createPayment(
      merchant.address,
      await token.getAddress(),
      ethers.parseUnits("1000", 6)
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === "PaymentCreated");
    const paymentId = event?.args?.[0];

    await payment.connect(customer).completePayment(paymentId);
    const merchantBalance = await token.balanceOf(merchant.address);
    expect(merchantBalance).to.equal(ethers.parseUnits("997", 6));
  });
});
