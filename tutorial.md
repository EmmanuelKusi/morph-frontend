# Comprehensive Tutorial: Creating a Frontend to Interact with iToken and iTokenFaucet on Morph

## Overview

In "[How To Build a DApp on Morph: A Comprehensive Guide](https://medium.com/@kusiemmanuelgreat/how-to-build-a-dapp-on-morph-a-comprehensive-guide-1e0000ac2924)", you learned how to set up and deploy your iToken and iTokenFaucet smart contracts using Hardhat. Now, it's time to bring those contracts to life with a user-friendly frontend application.

In this tutorial, we'll guide you through setting up a React application integrated with **Wagmi v2** and **RainbowKit** to interact with your deployed contracts on the Morph Holesky network. You'll learn how to connect wallets, display token balances, and enable users to claim tokens from the faucet.

In this tutorial, we'll set up a React frontend application using **Vite** with **TypeScript**, integrating **Wagmi v2** for Ethereum interactions, **RainbowKit** for wallet connections, and **Tailwind CSS** for styling. We'll ensure that all configurations align with the latest **Wagmi v2** migration guidelines.


## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Git
- Deployed iToken and iTokenFaucet contracts on the Morph Holesky network

## Step-by-Step Guide

### 1. Initialize a New Vite React TypeScript Project

First, create a new React project using Vite with the TypeScript template:

```bash
npm create vite@latest morph-frontend -- --template react-ts
cd morph-frontend
```

### 2. Initialize a Git Repository

```bash
git init
```

### 3. Install Dependencies

Install the necessary dependencies:

```bash
npm install @rainbow-me/rainbowkit wagmi viem@2.x @tanstack/react-query ethers
npm install -D tailwindcss postcss autoprefixer
```

### 4. Configure Tailwind CSS

Initialize Tailwind CSS:

```bash
npx tailwindcss init -p
```

Update `tailwind.config.cjs`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Update `postcss.config.cjs`:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Add Tailwind directives to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5. Define Contract Constants

Create `src/constants.ts`:

```typescript
export const ITOKEN_ADDRESS = '0xYourITokenAddressHere'
export const ITOKEN_FAUCET_ADDRESS = '0xYourITokenFaucetAddressHere'

export const ITOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint amount)',
]

export const ITOKEN_FAUCET_ABI = [
  'function claim() external',
  'function drain() external',
  'function dailyClaim() view returns (uint256)',
  'function lastClaimed(address) view returns (uint256)',
  'event Claimed(address indexed *claimer, uint256 *amount)',
]
```

### 6. Set Up Contract Hooks

Create `src/hooks/useContracts.ts`:

```typescript
import { ITOKEN_ADDRESS, ITOKEN_ABI, ITOKEN_FAUCET_ADDRESS, ITOKEN_FAUCET_ABI } from '../constants'

export const useIToken = () => ({
  address: ITOKEN_ADDRESS,
  abi: ITOKEN_ABI,
})

export const useITokenFaucet = () => ({
  address: ITOKEN_FAUCET_ADDRESS,
  abi: ITOKEN_FAUCET_ABI,
})
```

### 7. Configure the Main Entry Point

Update `src/main.tsx`:

```typescript
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
import { mainnet, sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

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
    default: ['https://rpc-quicknode-holesky.morphl2.io'],
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://explorer-holesky.morphl2.io' },
  },
  testnet: true,
}

const queryClient = new QueryClient()

const { connectors } = getDefaultWallets({
  appName: 'Morph Frontend',
  projectId: 'YOUR_PROJECT_ID',
  chains: [morphTestnet, mainnet, sepolia],
})

const config = createConfig({
  chains: [morphTestnet, mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [morphTestnet.id]: http(),
  },
  connectors,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider chains={[morphTestnet, mainnet, sepolia]} theme={darkTheme()}>
          <App />
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
```

### 8. Update the App Component

Update `src/App.tsx`:

```tsx
import React, { useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useSwitchChain } from 'wagmi'
import { useAccount } from 'wagmi'
import Balances from './components/Balances'
import Faucet from './components/Faucet'

function App() {
  const { chain, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()

  useEffect(() => {
    if (isConnected && chain?.id !== 2810) {
      switchChain?.(2810)
    }
  }, [isConnected, chain, switchChain])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-8">Morph L2 DApp</h1>
      <ConnectButton />
      {isConnected && chain?.id !== 2810 && (
        <p className="mt-4 text-red-500">
          Please switch to the Morph Holesky network.
        </p>
      )}
      {isConnected && chain?.id === 2810 && (
        <>
          <Balances />
          <Faucet />
        </>
      )}
    </div>
  )
}

export default App
```

### 9. Create the Balances Component

Create `src/components/Balances.tsx`:

```tsx
import React, { useEffect, useState } from 'react'
import { useAccount, useReadContracts } from 'wagmi'
import { useIToken } from '../hooks/useContracts'
import { erc20Abi } from 'viem'
import { formatUnits } from 'viem'

const Balances: React.FC = () => {
  const { address, isConnected } = useAccount()
  const iToken = useIToken()
  const [balance, setBalance] = useState<string>('0')

  const { data, isError, isLoading } = useReadContracts({
    contracts: [
      {
        address: iToken.address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address!],
      },
      {
        address: iToken.address,
        abi: erc20Abi,
        functionName: 'decimals',
      },
      {
        address: iToken.address,
        abi: erc20Abi,
        functionName: 'symbol',
      },
    ],
  })

  useEffect(() => {
    if (data && data[0] && data[1]) {
      const rawBalance = data[0].result as bigint
      const decimals = Number(data[1].result)
      const formatted = formatUnits(rawBalance, decimals)
      setBalance(formatted)
    }
  }, [data])

  if (!isConnected) {
    return null
  }

  if (isLoading) {
    return <p className="mt-8 text-xl">Loading balance...</p>
  }

  if (isError) {
    return <p className="mt-8 text-red-600">Error fetching balance.</p>
  }

  return (
    <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold">Your iToken Balance</h2>
      <p className="mt-2 text-xl">{balance} IT</p>
    </div>
  )
}

export default Balances
```

### 10. Create the Faucet Component

Create `src/components/Faucet.tsx`:

```tsx
import React, { useState } from 'react'
import { useITokenFaucet } from '../hooks/useContracts'
import { useAccount, useWriteContract, useSimulateContract } from 'wagmi'

const Faucet: React.FC = () => {
  const { isConnected } = useAccount()
  const faucet = useITokenFaucet()
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')

  const { data: simulationData, isLoading: isSimulating } = useSimulateContract({
    address: faucet.address,
    abi: faucet.abi,
    functionName: 'claim',
    args: [],
  })

  const { writeContract: claimWrite, isPending: isWriting } = useWriteContract()

  const handleClaim = () => {
    setLoading(true)
    setMessage('')
    claimWrite?.({
      address: faucet.address,
      abi: faucet.abi,
      functionName: 'claim',
      args: [],
    }, {
      onSuccess() {
        setMessage('Claim successful!')
        setLoading(false)
      },
      onError(error: any) {
        setMessage(error.message || 'Claim failed')
        setLoading(false)
      },
    })
  }

  return (
    <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold">iToken Faucet</h2>
      <button
        onClick={handleClaim}
        disabled={!isConnected || loading || isSimulating}
        className={`px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 disabled:opacity-50`}
      >
        {loading || isSimulating ? 'Claiming...' : 'Claim 1000 IT'}
      </button>
      {message && <p className="mt-2 text-green-600">{message}</p>}
      {(isWriting || isSimulating) && <p className="mt-2">Processing...</p>}
    </div>
  )
}

export default Faucet
```

### 11. Configure .gitignore

Update `.gitignore`:

```gitignore
# dependencies
/node_modules

# production
/dist

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# local env files
*.local

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# editor directories and files
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
```

### 12. Final Steps

1. Replace Placeholders:
   - In `src/constants.ts`, replace `'0xYourITokenAddressHere'` and `'0xYourITokenFaucetAddressHere'` with your actual contract addresses.
   - In `src/main.tsx`, replace `'YOUR_PROJECT_ID'` with your actual RainbowKit project ID.

2. Start the Development Server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to [http://localhost:5173](http://localhost:5173) to view your application.

## Conclusion

Congratulations! You've successfully set up a React frontend application integrated with Wagmi v2, RainbowKit, and Tailwind CSS. Your application now allows users to:

- Connect their Ethereum wallets via RainbowKit
- Automatically switch to the Morph Holesky network
- View their iToken balance
- Claim iTokens from the faucet

### Key Takeaways:

- Wagmi v2 Integration: Properly configured with QueryClientProvider, WagmiProvider, and RainbowKitProvider.
- Smart Contract Interactions: Utilized useReadContracts, useWriteContract, and useSimulateContract hooks for efficient contract interactions.
- Error Handling: Implemented robust error handling and user feedback mechanisms.
- Tailwind CSS: Configured for efficient and scalable styling.

### Next Steps:

- Enhance UI/UX: Further customize your components using Tailwind CSS.
- Expand Functionality: Add more features like staking or governance.
- Deployment: Prepare your application for deployment on platforms like Vercel, Netlify, or GitHub Pages.

Happy coding! 🚀