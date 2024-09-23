
## **Follow-Up Tutorial: Creating a Frontend to Interact with iToken and iTokenFaucet on Morph (Part 2)**

### **Overview**

In this tutorial, we'll delve into implementing smart contract interactions within your React frontend using the updated **Wagmi v2** API. We'll focus on two key components:

1. **Balances Component**: Displays the user's iToken balance.
2. **Faucet Component**: Allows users to claim iTokens from the faucet.

We'll ensure that these components are correctly configured to interact with your smart contracts using **Wagmi v2** and **Viem**.

### **Prerequisites**

- **Completed Tutorial 1**: Ensure that your project is set up with **Wagmi v2**, **RainbowKit**, and **Tailwind CSS**.
- **Smart Contracts Deployed**: You should have the `iToken` and `iTokenFaucet` contracts deployed on the **Morph Holesky** network.

### **Step-by-Step Guide**

#### **1. Define Contract Constants**

Ensure that you have defined the contract addresses and ABIs in `src/constants.ts`.

##### **1.1. Verify `src/constants.ts`**

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

**Note:** Replace `'0xYourITokenAddressHere'` and `'0xYourITokenFaucetAddressHere'` with your actual deployed contract addresses.

#### **2. Set Up Contract Hooks**

Ensure that your contract hooks are correctly set up to provide contract configurations.

##### **2.1. Verify `src/hooks/useContracts.ts`**

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

- The hooks return the necessary configurations to interact with the `iToken` and `iTokenFaucet` contracts.

#### **3. Implement the Balances Component**

This component fetches and displays the user's iToken balance.

##### **3.1. Update `src/components/Balances.tsx`**

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

- **useReadContracts Hook**: Fetches the user's balance, token decimals, and symbol in a single query.
- **Data Handling**: Uses `formatUnits` from **Viem** to format the raw balance based on the token's decimals.
- **Conditional Rendering**: Displays appropriate messages during loading and error states.

#### **4. Implement the Faucet Component**

This component allows users to claim iTokens from the faucet.

##### **4.1. Update `src/components/Faucet.tsx`**

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

- **useSimulateContract Hook**: Simulates the `claim` function to estimate gas and ensure the transaction is valid before execution.
- **useWriteContract Hook**: Executes the `claim` function on the contract.
- **Callbacks as Second Argument**: `onSuccess` and `onError` are passed as the second argument to `writeContract` for proper handling.
- **Loading and Error States**: Provides user feedback during the transaction process.

#### **5. Verify the Main Entry Point Configuration**

Ensure that your `main.tsx` correctly sets up all providers.

##### **5.1. Verify `src/main.tsx`**

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

- **QueryClientProvider**: Essential for providing TanStack Query context.
- **WagmiProvider**: Configured with the custom chain and transports.
- **RainbowKitProvider**: Manages wallet connections and theming.
- **RPC URLs**: Ensure that `rpcUrls` are arrays of strings, not objects.

#### **6. Tailwind CSS Configuration**

Ensure that Tailwind CSS is correctly configured to scan your project files.

##### **6.1. Verify `tailwind.config.cjs`**

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

**Note:** This configuration ensures that Tailwind CSS purges unused styles from all relevant files, optimizing your CSS bundle.

#### **7. Final Steps**

##### **7.1. Replace Placeholders**

- **Contract Addresses**: Replace `'0xYourITokenAddressHere'` and `'0xYourITokenFaucetAddressHere'` in `src/constants.ts` with your actual contract addresses.
- **RainbowKit Project ID**: Replace `'YOUR_PROJECT_ID'` in `src/main.tsx` with your actual **RainbowKit** project ID, which you can obtain from [RainbowKit](https://rainbowkit.com/).

##### **7.2. Start the Development Server**

Run the development server to test your application.

```bash
npm run dev
```

Open your browser and navigate to [http://localhost:5173](http://localhost:5173) to view your application.

**Expected Behavior:**

- **Connect Button**: Allows users to connect their Ethereum wallets via **RainbowKit**.
- **Network Switching**: Automatically prompts users to switch to the **Morph Holesky** network upon connection.
- **Balances Component**: Displays the connected user's iToken balance.
- **Faucet Component**: Enables users to claim iTokens from the faucet.

---

## **Conclusion**

By following these updated tutorials, you've successfully set up a React frontend application integrated with **Wagmi v2**, **RainbowKit**, and **Tailwind CSS**. You've also implemented components that interact with your smart contracts using the new **Wagmi v2** API, ensuring compatibility and leveraging enhanced features.

### **Key Takeaways:**

- **Wagmi v2 Integration**: Properly configured with **QueryClientProvider**, **WagmiProvider**, and **RainbowKitProvider**.
- **Smart Contract Interactions**: Utilized `useReadContracts`, `useWriteContract`, and `useSimulateContract` hooks to interact with smart contracts.
- **Error Handling**: Implemented robust error handling and user feedback mechanisms.
- **Tailwind CSS**: Configured for efficient and scalable styling.

### **Next Steps:**

- **Enhance UI/UX**: Customize your components further using **Tailwind CSS** for a more polished user interface.
- **Expand Functionality**: Add more features to your DApp, such as staking, governance, or integration with other DeFi protocols.
- **Deployment**: Prepare your application for deployment using platforms like **Vercel**, **Netlify**, or **GitHub Pages**.

If you encounter any further issues or have additional questions, feel free to ask!

Visit attached repo link for more details: https://github.com/EmmanuelKusi/morph-frontend

**Happy Coding! 🚀**