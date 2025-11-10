import { useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt
} from 'wagmi';
import { parseEther, formatEther } from 'viem'; 

import RewardTokenABI from './abi/RewardToken.json';

// --- !! IMPORTANT !! ---
// I have added your deployed contract address here.
const contractAddress = '0x1e9f2F91E0673E3313C68b49a2262814C7d8921e';
// -------------------------

// --- Etherscan URL (Sepolia) ---
const ETHERSCAN_URL = 'https://sepolia.etherscan.io';


// 1. Wallet Connection Component (--- UI FIX ADDED ---)
function ConnectWallet() {
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  return (
    <div className="card">
      <h3>1. Wallet Status</h3>
      {isConnected ? (
        <>
          <p>Connected:</p>
          {/* This 'address-display' class fixes the overflow */}
          <strong className="address-display">{address}</strong>
          <button onClick={() => disconnect()}>Disconnect</button>
        </>
      ) : (
        <>
          <p>Please connect your wallet.</p>
          {connectors.map((connector) => (
            <button key={connector.id} onClick={() => connect({ connector })}>
              Connect {connector.name}
            </button>
          ))}
        </>
      )}
    </div>
  );
}

// 2. Token Balance Component (--- UI FIX ADDED ---)
function TokenInfo() {
  const { address, isConnected } = useAccount();

  const { data: balance, refetch: refetchBalance } = useReadContract({
    abi: RewardTokenABI.abi,
    address: contractAddress,
    functionName: 'balanceOf',
    args: [address],
    enabled: isConnected,
  });

  const { data: tokenName } = useReadContract({
    abi: RewardTokenABI.abi,
    address: contractAddress,
    functionName: 'name',
  });
  
  const { data: tokenSymbol } = useReadContract({
    abi: RewardTokenABI.abi,
    address: contractAddress,
    functionName: 'symbol',
  });

  return (
    // This 'info-card' class fixes the spacing
    <div className="card info-card"> 
      <h3>2. Token Info</h3>
      <p>Name: <strong>{tokenName?.toString()}</strong></p>
      <p>Symbol: <strong>{tokenSymbol?.toString()}</strong></p>
      <p>
        Your PRT Balance: 
        <strong> {balance !== undefined ? formatEther(balance) : '0'} PRT</strong>
      </p>
      <button onClick={() => refetchBalance()}>Refresh Balance</button>
    </div>
  );
}

// 3. Add Token to Wallet Component (This will work now)
function AddTokenToWallet() {
  const [message, setMessage] = useState('');

  const addToken = async () => {
    if (!window.ethereum) {
      setMessage('MetaMask is not installed.');
      return;
    }

    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: contractAddress, // This now uses the correct address
            symbol: 'PRT', 
            decimals: 18,
          },
        },
      });

      if (wasAdded) {
        setMessage('Success! PRT token added to your wallet.');
      } else {
        setMessage('Token adding was cancelled.');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred.');
    }
  };

  return (
    <div className="card">
      <h3>3. Add PRT to Wallet</h3>
      <p>Click the button below to add the Phillip Reward Token (PRT) to your MetaMask wallet.</p>
      <button onClick={addToken}>Add PRT to MetaMask</button>
      {message && <p>{message}</p>}
    </div>
  );
}

// --- NEW 4. Faucet Link Card ---
function FaucetCard() {
  return (
    <div className="card">
      <h3>4. Claim PRT Tokens</h3>
      <p>Need some PRT to test? 
          Get free tokens from our Claim Page.</p>
      {/* This links to the faucet app we will run in Part 2 */}
      <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">
        <button>Go to Claim Page</button>
      </a>
    </div>
  );
}


// 5. Reward Me Component
function RewardMe() {
  const { address } = useAccount(); 
  const [rewardAmount, setRewardAmount] = useState('');
  const [localError, setLocalError] = useState(''); 

  const { data: contractOwner } = useReadContract({
    abi: RewardTokenABI.abi,
    address: contractAddress,
    functionName: 'owner',
  });

  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract();

  async function submitReward(e) {
    e.preventDefault();
    setLocalError(''); 

    if (contractOwner && address !== contractOwner) {
      setLocalError('Error: Unauthorised Owner');
      return; 
    }

    const amountInWei = parseEther(rewardAmount);
    
    writeContract({
      abi: RewardTokenABI.abi,
      address: contractAddress,
      functionName: 'rewardUser',
      args: [address, amountInWei], 
    });
  }
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const etherscanLink = hash ? `${ETHERSCAN_URL}/tx/${hash}` : '#';

  return (
    <div className="card">
      <h3>5. Reward Me (Owner Only)</h3>
      <form onSubmit={submitReward}>
        <div>
          <label>Amount (PRT):</label>
          <input
            type="number"
            value={rewardAmount}
            onChange={(e) => setRewardAmount(e.target.value)}
            placeholder="100"
            required
          />
        </div>
        <button type="submit" disabled={isPending || !contractOwner} className="button-green">
          {isPending ? 'Confirming...' : 'Get Reward'}
        </button>
      </form>
      
      {localError && <p className="error-text">{localError}</p>}
      {writeError && <p className="error-text">Error: {writeError.shortMessage || writeError.message}</p>}
      {hash && (
        <p>Transaction Sent! <a href={etherscanLink} target="_blank" rel="noopener noreferrer" className="tx-link">View on Etherscan</a></p>
      )}
      {isConfirming && <p>Waiting for confirmation...</p>}
      {isConfirmed && <p style={{ color: 'green', fontWeight: 'bold' }}>Transaction Confirmed!</p>}
    </div>
  );
}
    
// 6. Transfer Tokens Component
function TransferTokens() {
  const [transferAmount, setTransferAmount] = useState('');
  const [transferAddress, setTransferAddress] = useState('');
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  async function submitTransfer(e) {
    e.preventDefault();
    const amountInWei = parseEther(transferAmount);
    
    writeContract({
      abi: RewardTokenABI.abi,
      address: contractAddress,
      functionName: 'transfer',
      args: [transferAddress, amountInWei],
    });
  }
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const etherscanLink = hash ? `${ETHERSCAN_URL}/tx/${hash}` : '#';

  return (
    <div className="card">
      <h3>6. Transfer Tokens</h3>
      <form onSubmit={submitTransfer}>
        <div>
          <label>Recipient Address:</label>
          <input
            value={transferAddress}
            onChange={(e) => setTransferAddress(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>
        <div>
          <label>Amount (PRT):</label>
          <input
            type="number"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            placeholder="50"
            required
          />
        </div>
        <button type="submit" disabled={isPending}>
          {isPending ? 'Confirming...' : 'Transfer'}
        </button>
      </form>
      
      {error && <p className="error-text">Error: {error.shortMessage || error.message}</p>}
      {hash && (
        <p>Transaction Sent! <a href={etherscanLink} target="_blank" rel="noopener noreferrer" className="tx-link">View on Etherscan</a></p>
      )}
      {isConfirming && <p>Waiting for confirmation...</p>}
      {isConfirmed && <p style={{ color: 'green', fontWeight: 'bold' }}>Transaction Confirmed!</p>}
    </div>
  );
}


// --- Main App (Updated with new card) ---
function App() {
  const { isConnected } = useAccount();

  return (
    <div className="container">
      <h2>PhillipCapital Reward Token (PRT) DApp</h2>
      
      <div className="app-layout">
        <ConnectWallet />
        
        {isConnected && (
          <>
            <TokenInfo />
            <AddTokenToWallet />
            <FaucetCard /> {/* <-- NEW CARD ADDED */}
            <RewardMe />
            <TransferTokens />
          </>
        )}
      </div>

      {!isConnected && (
        <div className="card" style={{textAlign: 'center', backgroundColor: '#fffbe6'}}>
          <p><strong>Please connect your wallet to see token info and actions.</strong></p>
        </div>
      )}
    </div>
  );
}

export default App;