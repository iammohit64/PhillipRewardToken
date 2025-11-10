# PhillipCapital Reward Token DApp

[cite_start]This repository contains the full-stack solution for the "Tokenized Reward System" case study[cite: 2]. It includes a React.js/wagmi DApp for users and a separate Node.js/Ethers.js token faucet for claiming.

## Project Structure

This is a monorepo with two separate applications:

* **/frontend**: The main React (Vite) DApp that allows users to connect their wallet, check their PRT balance, transfer tokens, and claim rewards (if they are the owner).
* **/faucet**: A Node.js (Express) server application that acts as a secure token faucet. It allows any user to claim a small amount of PRT tokens for testing.

---

## 1. Frontend DApp (React + wagmi)

The main user-facing application.

### Features
* Connect MetaMask Wallet (wagmi/viem)
* View PRT Token Balance
* Transfer PRT Tokens
* "Reward Me" (Owner-only function)
* "Add PRT to MetaMask" button
* Link to the token faucet

### How to Run Locally
1.  `cd frontend`
2.  `npm install`
3.  `npm run dev`
    * App will be running at `http://localhost:5173`

---

## 2. Faucet Server (Node.js + Ethers.js)

A backend server to securely distribute faucet tokens.

### Features
* [cite_start]Serves a simple HTML/CSS/JS interface[cite: 24, 30].
* [cite_start]Backend API endpoint (`/claim`) that securely handles token transfers.
* [cite_start]The `FAUCET_PRIVATE_KEY` is kept secure on the server and is never exposed[cite: 23, 29].
* [cite_start]Validates claim amount (1-1000 PRT).
* [cite_start]Provides Etherscan links for transactions[cite: 30].

### How to Run Locally
1.  `cd faucet`
2.  [cite_start]Create a `.env` file (see `.env.example`) with your `RPC_URL`, `FAUCET_PRIVATE_KEY`, and `TOKEN_CONTRACT_ADDRESS`[cite: 23].
3.  `npm install`
4.  `npm run dev`
    * Server will be running at `http://localhost:3000`

---

## Case Study: Short Note

[cite_start]This note fulfills the documentation requirement of the case study[cite: 2].

### Contract Design Choices
The `RewardToken.sol` contract is a robust ERC-20 token built using OpenZeppelin's secure contracts. [cite_start]It inherits from `ERC20` (standard token functionality), `Ownable` (to restrict `rewardUser` to the contract deployer), and `Pausable` (as an emergency stop-gap)[cite: 2]. Beyond the case study requirements, I added a `rewardMultipleUsers` batch function for gas efficiency and a public `burn` function.

### Gas Optimization & Security
* **OpenZeppelin:** Using audited OpenZeppelin contracts is the primary security measure.
* **`onlyOwner` Modifier:** This ensures only the deployer (PhillipCapital) can distribute reward tokens.
* **`whenNotPaused` Modifier:** Applied to all transfer functions for emergency control.
* **Solidity 0.8.20:** This version provides built-in protection against integer overflows.
* **`require` Checks:** All functions include checks for zero addresses, zero amounts, and insufficient balances to prevent invalid states.