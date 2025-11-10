# PhillipCapital Reward Token DApp

[cite_start]This project is the complete solution for the "Tokenized Reward System" case study[cite: 1]. It features a React DApp for users, a Node.js faucet for claiming test tokens, and the original Solidity smart contract.

## Project Structure

This repo is a "monorepo" containing three separate parts:

* [cite_start]`/contract`: Contains the final, cleaned `RewardToken.sol` smart contract[cite: 44].
* [cite_start]`/frontend`: The main React + wagmi DApp where users can check balances and transfer tokens[cite: 45].
* `/faucet`: A separate Node.js server that acts as a secure faucet to give out test tokens.

---

## 🚀 Deployment & Contract Address

[cite_start]The `RewardToken.sol` contract was deployed to the **Sepolia Testnet** using **Remix IDE**[cite: 38].

**Contract Address:** `0x1e9f2F91E0673E3313C68b49a2262814C7d8921e`

You can view the contract on Etherscan:
[https://sepolia.etherscan.io/address/0x1e9f2F91E0673E3313C68b49a2262814C7d8921e](https://sepolia.etherscan.io/address/0x1e9f2F91E0673E3313C68b49a2262814C7d8921e)

---

## 1. Frontend (React DApp)

This is the main user-facing app. [cite_start]It lets users connect their wallet, see their PRT balance, transfer tokens, and add the token to their MetaMask with one click[cite: 28]. [cite_start]The contract owner can also use the "Reward Me" feature[cite: 34].

### How to Run
1.  Navigate into the folder: `cd frontend`
2.  Install dependencies: `npm install`
3.  Run the dev server: `npm run dev`
4.  Open `http://localhost:5173` in your browser.

---

## 2. Faucet (Node.js Server)

This is a backend Express.js server that securely gives out test tokens. The wallet's private key stays safe on the server and is never exposed to the frontend.

### How to Run
1.  Navigate into the folder: `cd faucet`
2.  Install dependencies: `npm install`
3.  Create a `.env` file (you can copy `.env.example`).
4.  Fill in your `RPC_URL`, `FAUCET_PRIVATE_KEY` (the owner wallet), and `TOKEN_CONTRACT_ADDRESS`.
5.  Run the dev server: `npm run dev`
6.  The faucet will be live at `http://localhost:3000`.

---

## 📝 Case Study Note

[cite_start]Here are the design and security notes required by the case study[cite: 47].

### Contract Design
The `RewardToken.sol` contract is a standard ERC-20 token built on OpenZeppelin's secure, audited contracts. [cite_start]I inherited from `ERC20` (for token functions), `Ownable` (to make the `rewardUser` function secure)[cite: 26], and `Pausable` (as an emergency feature to stop transfers if needed).

Beyond the basics, I added `rewardMultipleUsers` for gas-efficient batch rewards and a `burn` function for users.

### Security & Gas
* **Security:** The main security comes from using OpenZeppelin. [cite_start]The `onlyOwner` modifier is the primary check, ensuring only the company can distribute rewards[cite: 49]. [cite_start]I also used `pragma solidity ^0.8.20`, which has built-in overflow/underflow protection[cite: 49].
* **Gas:** The `rewardMultipleUsers` function is the biggest gas optimization, allowing many users to be rewarded in a single transaction. All functions use `require` statements to fail fast and refund gas on bad inputs (like zero addresses).