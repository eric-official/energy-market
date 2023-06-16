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

export {
    isWalletConnected,
    connectWallet,
}