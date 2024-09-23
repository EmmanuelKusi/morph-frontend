
## **Follow-Up Tutorial: Creating a Frontend to Interact with iToken and iTokenFaucet on Morph (Part 1)**

### **Overview**

In "[How To Build a DApp on Morph: A Comprehensive Guide](https://medium.com/@kusiemmanuelgreat/how-to-build-a-dapp-on-morph-a-comprehensive-guide-1e0000ac2924)", you learned how to set up and deploy your iToken and iTokenFaucet smart contracts using Hardhat. Now, it's time to bring those contracts to life with a user-friendly frontend application.

In this tutorial, we'll guide you through setting up a React application integrated with **Wagmi v2** and **RainbowKit** to interact with your deployed contracts on the Morph Holesky network. You'll learn how to connect wallets, display token balances, and enable users to claim tokens from the faucet.

In this tutorial, we'll set up a React frontend application using **Vite** with **TypeScript**, integrating **Wagmi v2** for Ethereum interactions, **RainbowKit** for wallet connections, and **Tailwind CSS** for styling. We'll ensure that all configurations align with the latest **Wagmi v2** migration guidelines.



### **Prerequisites**

- **Node.js** (v14 or later)
- **npm** (v6 or later)
- **Git**

### **Step-by-Step Guide**

#### **1. Initialize a New Vite React TypeScript Project**

First, create a new React project using **Vite** with the **TypeScript** template.

```bash
npm create vite@latest morph-frontend -- --template react-ts
```

Navigate into the project directory:

```bash
cd morph-frontend
```

#### **2. Initialize a Git Repository**

Initialize a new Git repository to track your project changes.

```bash
git init
```

#### **3. Install Dependencies**

Install the necessary dependencies, including **Wagmi v2**, **RainbowKit**, **Viem**, **TanStack Query**, and **Tailwind CSS**.

```bash
npm install @rainbow-me/rainbowkit wagmi viem@2.x @tanstack/react-query ethers
npm install -D tailwindcss postcss autoprefixer
```

#### **4. Configure Tailwind CSS**

Initialize **Tailwind CSS** with its configuration files.

```bash
npx tailwindcss init -p
```

This will create two files: `tailwind.config.cjs` and `postcss.config.cjs`.

##### **4.1. Update `tailwind.config.cjs`**

Configure Tailwind to purge unused styles by specifying the paths to all your template files.

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

##### **4.2. Update `postcss.config.cjs`**

Ensure that **PostCSS** uses **Tailwind CSS** and **Autoprefixer**.

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

##### **4.3. Add Tailwind Directives to `src/index.css`**

Replace the existing content of `src/index.css` with Tailwind's base, components, and utilities.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### **5. Define Contract Constants**

Create a `constants.ts` file to store your smart contract addresses and ABIs.

##### **5.1. Create `src/constants.ts`**

```typescript
// src/constants.ts

export const ITOKEN_ADDRESS = '0xYourITokenAddressHere'
export const ITOKEN_FAUCET_ADDRESS = '0xYourITokenFaucetAddressHere'

// ABI for iToken (ERC20)
export const ITOKEN_ABI = [
  // Only include the functions you need
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint amount)',
]

// ABI for iTokenFaucet
export const ITOKEN_FAUCET_ABI = [
  'function claim() external',
  'function drain() external',
  'function dailyClaim() view returns (uint256)',
  'function lastClaimed(address) view returns (uint256)',
  'event Claimed(address indexed _claimer, uint256 _amount)',
]
```

#### **6. Set Up Contract Hooks**

Create hooks to interact with your smart contracts using **Wagmi v2**.

##### **6.1. Create `src/hooks/useContracts.ts`**

```typescript
// src/hooks/useContracts.ts

import { useContract } from 'wagmi'
import { ITOKEN_ADDRESS, ITOKEN_ABI, ITOKEN_FAUCET_ADDRESS, ITOKEN_FAUCET_ABI } from '../constants'

export const useIToken = () => {
  return ({
    address: ITOKEN_ADDRESS,
    abi: ITOKEN_ABI,
  })
}

export const useITokenFaucet = () => {
  return ({
    address: ITOKEN_FAUCET_ADDRESS,
    abi: ITOKEN_FAUCET_ABI,
  })
}
```

**Explanation:**

- The hooks return the contract configurations, which will be used in your components to interact with the contracts.

#### **7. Configure the Main Entry Point**

Set up the main entry point of your application to include **Wagmi v2**, **RainbowKit**, and **TanStack Query** providers.

##### **7.1. Update `src/main.tsx`**

```typescript
// src/main.tsx

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
    default: ['https://rpc-quicknode-holesky.morphl2.io'],
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://explorer-holesky.morphl2.io' },
  },
  testnet: true,
}

// Initialize TanStack Query's QueryClient
const queryClient = new QueryClient()

// Get default wallet connectors
const { connectors } = getDefaultWallets({
  appName: 'Morph Frontend',
  projectId: 'YOUR_PROJECT_ID', // Replace with your RainbowKit project ID
  chains: [morphTestnet, mainnet, sepolia],
})

// Create Wagmi config
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
    {/* Wrap the app with QueryClientProvider */}
    <QueryClientProvider client={queryClient}>
      {/* Wrap with WagmiProvider */}
      <WagmiProvider config={config}>
        {/* Wrap with RainbowKitProvider */}
        <RainbowKitProvider chains={[morphTestnet, mainnet, sepolia]} theme={darkTheme()}>
          <App />
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
```

**Key Points:**

- **QueryClientProvider**: Provides the TanStack Query context required by **Wagmi v2** and **RainbowKit**.
- **WagmiProvider**: Replaces the deprecated `WagmiConfig` and is configured with the custom chain and transports.
- **RainbowKitProvider**: Handles wallet connections and theming.

#### **8. Update the App Component**

Ensure that the `App` component manages network switching and conditionally renders components based on the connected network.

##### **8.1. Update `src/App.tsx`**

```typescript
// src/App.tsx

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
      // Attempt to switch to Morph Holesky network
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

**Explanation:**

- **useSwitchChain Hook**: Utilized to programmatically switch the user's wallet to the **Morph Holesky** network upon connection.
- **Conditional Rendering**: Displays the `Balances` and `Faucet` components only when connected to the correct network.

#### **9. Create the Balances Component**

Implement a component to display the user's token balance.

##### **9.1. Update `src/components/Balances.tsx`**

```tsx
// src/components/Balances.tsx

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
    console.log(data)
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

**Key Points:**

- **useReadContracts Hook**: Fetches multiple contract calls (`balanceOf`, `decimals`, and `symbol`) in a single query.
- **Data Handling**: Extracts and formats the raw balance using `formatUnits` from **Viem**.
- **Conditional Rendering**: Displays loading and error states appropriately.

#### **10. Create the Faucet Component**

Implement a component that allows users to claim tokens from the faucet.

##### **10.1. Update `src/components/Faucet.tsx`**

```tsx
// src/components/Faucet.tsx

import React, { useState } from 'react'
import { useITokenFaucet } from '../hooks/useContracts'
import { useAccount, useWriteContract, useSimulateContract } from 'wagmi'

const Faucet: React.FC = () => {
  const { isConnected } = useAccount()
  const faucet = useITokenFaucet()
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')

  // Simulate the contract call
  const { data: simulationData, isLoading: isSimulating } = useSimulateContract({
    address: faucet.address,
    abi: faucet.abi,
    functionName: 'claim',
    args: [],
  })

  // Write to the contract
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

**Key Points:**

- **useWriteContract Hook**: Handles writing to the contract, with callbacks for success and error states.
- **useSimulateContract Hook**: Simulates the contract call before executing it.
- **Error Handling**: Displays error messages retrieved from the contract interaction.

#### **11. Configure `.gitignore`**

Ensure that sensitive files and unnecessary directories are excluded from version control.

##### **11.1. Update `.gitignore`**

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

#### **12. Commit Initial Setup**

Commit all the initial configurations and code to your Git repository.

```bash
git add .
git commit -m "Initial commit - Setup Morph Frontend with Wagmi v2"
```
### **Conclusion**

Congratulations! You've successfully set up a React frontend application using Vite with TypeScript, integrated RainbowKit for wallet connections, and Tailwind CSS for styling. 

In the next part of this tutorial series, we'll delve into implementing smart contract interactions within your React frontend using the updated **Wagmi v2** API.

Happy coding!
