// public/script.js

document.getElementById('claimButton').addEventListener('click', async () => {
    const walletAddress = document.getElementById('walletAddress').value;
    const tokenAmount = document.getElementById('tokenAmount').value;
    const claimButton = document.getElementById('claimButton');
    const messageDiv = document.getElementById('message');

    // Basic validation
    if (!walletAddress || !tokenAmount) {
        messageDiv.textContent = 'Please enter both a wallet address and an amount.';
        messageDiv.style.color = 'red';
        return;
    }

    // UI feedback
    claimButton.disabled = true;
    claimButton.textContent = 'Processing...';
    messageDiv.textContent = '';
    messageDiv.style.color = 'black';

    try {
        const response = await fetch('/claim', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                address: walletAddress,
                amount: tokenAmount
            }),
        });

        const data = await response.json();

        if (response.ok) {
            messageDiv.style.color = 'green';
            
            // --- UPDATED to Sepolia Etherscan ---
            const explorerUrl = `https://sepolia.etherscan.io/tx/${data.txHash}`;
            
            messageDiv.innerHTML = `Success! <a href="${explorerUrl}" target="_blank" rel="noopener noreferrer">View Transaction</a>`;
            
            // Clear inputs on success
            document.getElementById('walletAddress').value = '';
            document.getElementById('tokenAmount').value = '';
        } else {
            messageDiv.style.color = 'red';
            messageDiv.textContent = `Error: ${data.error || 'An unexpected error occurred.'}`;
        }

    } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'An unexpected network error occurred.';
        console.error('Fetch Error:', error);

    } finally {
        // Restore button
        claimButton.disabled = false;
        claimButton.textContent = 'Claim Tokens';
    }
});