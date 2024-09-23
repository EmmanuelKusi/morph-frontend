import {  usePublicClient } from 'wagmi'
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
