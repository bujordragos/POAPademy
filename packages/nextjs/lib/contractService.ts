// lib/contractService.ts
import { ethers } from "ethers";

// Your contract ABI - you can import this from a JSON file if preferred
const CertificateABI = [
  // Only including the necessary functions to keep this cleaner
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "courseId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "courseName",
        type: "string",
      },
      {
        internalType: "string",
        name: "courseDescription",
        type: "string",
      },
    ],
    name: "mintPOAP",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Add the certificateExists function to the ABI
  {
    inputs: [
      {
        internalType: "uint256",
        name: "courseId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "certificateExists",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// Configuration for Hardhat local network
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const HARDHAT_RPC_URL = "http://127.0.0.1:8545";

// Private key from Hardhat accounts (this is the default first account private key)
// In production, this would come from an environment variable
const ADMIN_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

/**
 * Checks if a certificate already exists for a user and course
 *
 * @param recipientAddress The wallet address to check
 * @param courseId The ID of the course to check
 * @returns Boolean indicating if the certificate exists
 */
export async function checkCertificateExists(recipientAddress: string, courseId: number): Promise<boolean> {
  if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
    throw new Error("Invalid recipient wallet address");
  }

  try {
    // Create provider for local Hardhat network (read-only is fine for checking)
    const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);

    // Create contract instance (no need for signer for read-only operations)
    const certificateContract = new ethers.Contract(CONTRACT_ADDRESS, CertificateABI, provider);

    // Call the certificateExists function from the smart contract
    return await certificateContract.certificateExists(courseId, recipientAddress);
  } catch (error: any) {
    console.error("Error checking if certificate exists:", error);
    // Return false by default if the check fails
    return false;
  }
}

/**
 * Mints a certificate NFT (POAP) for a user who completed a course
 *
 * @param recipientAddress The wallet address to receive the certificate
 * @param courseId The ID of the completed course
 * @param courseName The name of the completed course
 * @param courseDescription Description of the completed course
 * @returns Transaction hash of the minting operation
 */
export async function mintCertificate(
  recipientAddress: string,
  courseId: number,
  courseName: string,
  courseDescription: string,
): Promise<string> {
  // Validate input parameters
  if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
    throw new Error("Invalid recipient wallet address");
  }

  console.log(`Starting certificate minting process for recipient: ${recipientAddress}, course: ${courseId}`);

  try {
    // First check if certificate already exists
    const exists = await checkCertificateExists(recipientAddress, courseId);
    if (exists) {
      throw new Error("Certificate already minted for this course for this recipient");
    }

    // Create provider and signer for local Hardhat network
    const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
    const signer = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

    // Get network info for logging
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);

    // Create contract instance
    const certificateContract = new ethers.Contract(CONTRACT_ADDRESS, CertificateABI, signer);

    // Send the transaction to mint the POAP certificate
    console.log("Sending mintPOAP transaction...");
    const tx = await certificateContract.mintPOAP(recipientAddress, courseId, courseName, courseDescription, {
      gasLimit: 500000, // Hardhat doesn't need this but it's good practice
    });

    console.log(`Transaction sent: ${tx.hash}`);

    // Wait for transaction confirmation
    const receipt = await tx.wait(1); // Wait for 1 confirmation

    console.log(`Certificate successfully minted! Transaction hash: ${receipt.transactionHash}`);

    return receipt.transactionHash;
  } catch (e) {
    const error = e as any;
    console.error("Error in mintCertificate:", error);

    // Provide clearer error messages based on common issues
    if (error.message && error.message.includes("already minted")) {
      throw new Error("Certificate already exists for this user and course");
    }

    if (error.code === "INSUFFICIENT_FUNDS") {
      throw new Error("Admin wallet does not have enough ETH for gas");
    }

    if (error.code === "CALL_EXCEPTION" || error.code === "UNPREDICTABLE_GAS_LIMIT") {
      throw new Error("Contract call failed: you may not have permission to mint or contract is not properly deployed");
    }

    if (error.code === "NETWORK_ERROR") {
      throw new Error("Cannot connect to Hardhat node. Make sure it is running at " + HARDHAT_RPC_URL);
    }

    // Re-throw with more context
    throw new Error(`Certificate minting failed: ${error.message}`);
  }
}

// Add this at the bottom to expose the checkCertificateExists function to the mintCertificate object
// This is needed because we referenced it as mintCertificate.checkCertificateExists in the API
Object.assign(mintCertificate, { checkCertificateExists });
