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
      const decimals = Number(data[1].result )
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
