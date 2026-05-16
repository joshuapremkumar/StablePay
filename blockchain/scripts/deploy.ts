import { ethers } from "hardhat";

async function main() {
  console.log("Deploying StablePay contracts...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy mock USDC token
  const StablePayToken = await ethers.getContractFactory("StablePayToken");
  const usdc = await StablePayToken.deploy("USD Coin", "USDC", 6, ethers.parseUnits("10000000", 6));
  await usdc.waitForDeployment();
  console.log("USDC deployed to:", await usdc.getAddress());

  // Deploy mock AE Coin
  const aeCoin = await StablePayToken.deploy("AE Coin", "AEC", 18, ethers.parseUnits("10000000", 18));
  await aeCoin.waitForDeployment();
  console.log("AE Coin deployed to:", await aeCoin.getAddress());

  // Deploy Payment contract
  const StablePayPayment = await ethers.getContractFactory("StablePayPayment");
  const payment = await StablePayPayment.deploy(deployer.address);
  await payment.waitForDeployment();
  console.log("Payment contract deployed to:", await payment.getAddress());

  // Deploy Settlement contract
  const StablePaySettlement = await ethers.getContractFactory("StablePaySettlement");
  const settlement = await StablePaySettlement.deploy(await payment.getAddress());
  await settlement.waitForDeployment();
  console.log("Settlement contract deployed to:", await settlement.getAddress());

  // Deploy Letter of Credit contract
  const StablePayLetterOfCredit = await ethers.getContractFactory("StablePayLetterOfCredit");
  const loc = await StablePayLetterOfCredit.deploy();
  await loc.waitForDeployment();
  console.log("Letter of Credit deployed to:", await loc.getAddress());

  // Deploy Escrow contract
  const StablePayEscrow = await ethers.getContractFactory("StablePayEscrow");
  const escrow = await StablePayEscrow.deploy();
  await escrow.waitForDeployment();
  console.log("Escrow deployed to:", await escrow.getAddress());

  // Deploy Invoice Financing contract
  const StablePayInvoiceFinancing = await ethers.getContractFactory("StablePayInvoiceFinancing");
  const invoiceFinancing = await StablePayInvoiceFinancing.deploy();
  await invoiceFinancing.waitForDeployment();
  console.log("Invoice Financing deployed to:", await invoiceFinancing.getAddress());

  console.log("\n=== Deployment Summary ===");
  console.log("USDC:", await usdc.getAddress());
  console.log("AE Coin:", await aeCoin.getAddress());
  console.log("Payment:", await payment.getAddress());
  console.log("Settlement:", await settlement.getAddress());
  console.log("Letter of Credit:", await loc.getAddress());
  console.log("Escrow:", await escrow.getAddress());
  console.log("Invoice Financing:", await invoiceFinancing.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
