import { ethers } from 'ethers'
import { setGlobalState } from './dataStore'
const { ethereum } = window


const isWalletConnected = async () => {
    try {
        if (!ethereum) return alert('Please install Metamask')
        const accounts = await ethereum.request({ method: 'eth_accounts' })

        if (accounts.length) {
            setGlobalState('connectedAccount', accounts[0])
        } else {
            console.log('No accounts found.')
        }
    } catch (error) {
        console.log(error)
        throw new Error('No ethereum object.')
    }
}

const connectWallet = async () => {
    try {
        if (!ethereum) return alert('Please install Metamask')
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        setGlobalState('connectedAccount', accounts[0])
    } catch (error) {
        console.log(error)
        throw new Error('No ethereum object.')
    }
}

async function getContract(contractAddress, contractAbi) {
    const provider = new ethers.AlchemyProvider("goerli", "EUL_b0M4xTEMnUpJvDAZpSdRJQiKNWid");
    const signer = new ethers.Wallet("8db49dd3304778a40cc33e17a7427bdf7aee01d5be385029f848579399f109cc", provider)
    const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
    )
    return contract
}

export {
    getContract,
    isWalletConnected,
    connectWallet,
}