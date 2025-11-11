# PhillipCapital Reward Token DApp

This project is the complete solution for the "Tokenized Reward System" case study. It features a React DApp for users, a Node.js server for a token claim page, and the original Solidity smart contract.

## 🚀 Live URLs & Contract

* **Main DApp:** [https://phillip-reward-dapp.vercel.app/](https://phillip-reward-dapp.vercel.app/)
* **Token Claim Page (Faucet):** [https://phillip-token-claim.vercel.app/](https://phillip-token-claim.vercel.app/)

### Contract Details
The `RewardToken.sol` contract was deployed to the **Sepolia Testnet** using **Remix IDE**.

**Contract Address:** `0x1e9f2F91E0673E3313C68b49a2262814C7d8921e`

**View on Etherscan:**
[https://sepolia.etherscan.io/address/0x1e9f2F91E0673E3313C68b49a2262814C7d8921e](https://sepolia.etherscan.io/address/0x1e9f2F91E0673E3313C68b49a2262814C7d8921e)

---

## Project Structure

This repo contains three separate parts:

* `/contract`: Contains the final `RewardToken.sol` smart contract.
* `/frontend`: The main React + wagmi DApp where users can check balances and transfer tokens.
* `/faucet`: To improve user experience, A separate Node.js server that acts as a secure claim page to give out test tokens.

---

## 1. Frontend (React DApp)

This is the main user-facing app. It lets users connect their wallet, see their PRT balance, transfer tokens, and add the token to their MetaMask with one click. The contract owner can also use the "Reward Me" feature.

### How to Run
1.  Navigate into the folder: `cd frontend`
2.  Install dependencies: `npm install`
3.  Run the dev server: `npm run dev`
4.  Open `http://localhost:5173` in your browser.

---

## 2. Faucet (Node.js Claim Page)

This is a backend Express.js server that securely gives out test tokens. The wallet's private key stays safe on the server and is never exposed to the frontend.

### How to Run
1.  Navigate into the folder: `cd faucet`
2.  Install dependencies: `npm install`
3.  Create a `.env` file.
4.  Fill in your `RPC_URL`, `FAUCET_PRIVATE_KEY` (the owner wallet), and `TOKEN_CONTRACT_ADDRESS`.
5.  Run the dev server: `npm run dev`
6.  The claim page will be live at `http://localhost:3000`.

---

## 📝 Case Study Note

Here are the design and security notes required by the case study.

### Contract Design
The `RewardToken.sol` contract is a standard ERC-20 token built on OpenZeppelin's secure, audited contracts. I inherited from `ERC20` (for token functions), `Ownable` (to make the `rewardUser` function secure), and `Pausable` (as an emergency feature to stop transfers if needed).

Beyond the basics, I added `rewardMultipleUsers` for gas-efficient batch rewards and a `burn` function for users.

### Security & Gas
* **Security:** The main security comes from using OpenZeppelin. The `onlyOwner` modifier is the primary check, ensuring only the company can distribute rewards. I also used `pragma solidity ^0.8.20`, which has built-in overflow/underflow protection.
* **Gas:** The `rewardMultipleUsers` function is the biggest gas optimization, allowing many users to be rewarded in a single transaction. All functions use `require` statements to fail fast and refund gas on bad inputs (like zero addresses).
