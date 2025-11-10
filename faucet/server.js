// server.js 
require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Ethers Setup ---
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const faucetWallet = new ethers.Wallet(process.env.FAUCET_PRIVATE_KEY, provider);

const tokenAbi = ["function transfer(address to, uint256 amount)"];
const tokenInterface = new ethers.Interface(tokenAbi);

const tokenContract = new ethers.Contract(
    process.env.TOKEN_CONTRACT_ADDRESS,
    tokenInterface,
    faucetWallet
);

// --- API Endpoint ---
app.post('/claim', async (req, res) => {
    try {
        const { address, amount } = req.body;

        if (!ethers.isAddress(address)) {
            return res.status(400).json({ error: "Invalid wallet address." });
        }

        const numericAmount = parseFloat(amount);

        if (!amount || isNaN(numericAmount) || numericAmount < 1 || numericAmount > 1000) {
            return res.status(400).json({ error: "Amount must be between 1 and 1000." });
        }

        const amountToSend = ethers.parseUnits(amount, 18);

        // 1. Fetch the current recommended gas price from the network.
        const feeData = await provider.getFeeData();
        
        // 2. Send the transaction with the explicit gas price.
        const tx = await tokenContract.transfer(address, amountToSend, {
            gasPrice: feeData.gasPrice 
        });

        console.log(`Transaction sent. Hash: ${tx.hash}`);

        // Respond immediately with the transaction hash.
        res.status(200).json({ message: "Transaction sent successfully!", txHash: tx.hash });

    } catch (error) {
        console.error("Claiming failed:", error);
        // Provide a more specific error message if available
        const errorMessage = error.reason || "Failed to send transaction. Please check server logs.";
        res.status(500).json({ error: errorMessage });
    }
});

// Export the app for Vercel
module.exports = app;

// --- BLOCK TO RUN IT LOCALLY ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});