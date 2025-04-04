import { ethers } from "ethers";

const providerUrl = process.env.NEXT_PUBLIC_PROVIDER_URL || "http://localhost:8545";
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xYourContractAddress"; // modifica

// Minimal ABI for mintPOAP function
const contractAbi = [
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "courseId", type: "uint256" },
      { internalType: "string", name: "courseName", type: "string" },
      { internalType: "string", name: "courseDescription", type: "string" },
    ],
    name: "mintPOAP",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

interface MintResult {
  transactionHash: string;
  tokenId?: number;
}

export const mintCertificate = async (
  recipientAddress: string,
  courseId: number,
  courseName: string,
  courseDescription: string,
): Promise<MintResult> => {
  try {
    // Validate inputs
    if (!ethers.isAddress(recipientAddress)) {
      throw new Error("Invalid recipient address");
    }
    if (courseId <= 0) {
      throw new Error("Course ID must be positive");
    }

    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(providerUrl);

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("PRIVATE_KEY environment variable not set");
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

    // Estimate gas first
    const gasEstimate = await contract.mintPOAP.estimateGas(recipientAddress, courseId, courseName, courseDescription);
    // Send transaction with 20% gas buffer
    const gasLimit = (gasEstimate * 120n) / 100n;

    const tx = await contract.mintPOAP(recipientAddress, courseId, courseName, courseDescription, {
      gasLimit: gasLimit, // Use the calculated buffer
    });

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error("Transaction receipt not found");
    }

    // Parse events to get tokenId if needed
    let tokenId: number | undefined;
    if (receipt.logs) {
      const event = contract.interface.parseLog(receipt.logs[0]);
      if (event?.name === "POAPMinted") {
        tokenId = Number(event.args.tokenId);
      }
    }

    return {
      transactionHash: tx.hash,
      tokenId,
    };
  } catch (error) {
    console.error("Minting error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to mint certificate");
  }
};
