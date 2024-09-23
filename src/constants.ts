export const ITOKEN_ADDRESS = '0x5086D4873B48041D276E40b7bd5644E6C3c0D247' as `0x${string}`
export const ITOKEN_FAUCET_ADDRESS = '0xF2E381ee43cdC0CD99f107eBb9820ca27DA0A1BE' as `0x${string}`

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
