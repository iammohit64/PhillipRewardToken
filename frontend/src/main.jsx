import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 1. Import wagmi components
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { metaMask } from 'wagmi/connectors'

// 2. Create wagmi config
const config = createConfig({
  chains: [sepolia], 
  connectors: [
    metaMask(),
  ],
  transports: {
    [sepolia.id]: http(), 
  },
});

// 3. Create QueryClient
const queryClient = new QueryClient();

// 4. Wrap App with providers
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);