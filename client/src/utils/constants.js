import ethArtifact from './ElectricityTradingHub.json'
import rppArtifact from './RenewableProviderPool.json'

export const ethABI = ethArtifact.abi
export const rppABI = rppArtifact.abi

export const ethAddress = ''
export const rppAddress = ''

const provider = new ethers.AlchemyProvider("goerli", "E2K2brgSFqHPDNat-3WNPu0cyCu4kiaU")