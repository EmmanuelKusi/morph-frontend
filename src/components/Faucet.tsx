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
    },{
      onSuccess() {
        setMessage('Claim successful!')
        setLoading(false)
      },
      onError(error: any) {
        setMessage(error)
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
