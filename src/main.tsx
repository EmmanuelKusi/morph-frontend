import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css'

import {
  RainbowKitProvider,
  getDefaultWallets,
  darkTheme,
} from '@rainbow-me/rainbowkit'
import { createConfig, WagmiProvider } from 'wagmi'
import { http } from 'wagmi'
import { Chain, mainnet, sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Define custom chain for Morph L2
const morphTestnet = {
  id: 2810,
  name: 'Morph Holesky',
  network: 'morphTestnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {http: ['https://rpc-quicknode-holesky.morphl2.io']},
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://explorer-holesky.morphl2.io' },
  },
  testnet: true,
} as Chain

const queryClient = new QueryClient()

const { connectors } = getDefaultWallets({
  appName: 'Morph Frontend',
  projectId: 'YOUR_PROJECT_ID',
})


const config = createConfig({
  chains: [morphTestnet, mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [morphTestnet.id]: http(),
  },
  connectors
})


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <WagmiProvider config={config}>
      <RainbowKitProvider initialChain={morphTestnet} theme={darkTheme()}>
        <App />
      </RainbowKitProvider>
    </WagmiProvider>
  </QueryClientProvider> 
  </React.StrictMode>,
)
