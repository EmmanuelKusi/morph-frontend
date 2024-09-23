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
      switchChain({
        chainId: 2810,
      },{
        
      })
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
