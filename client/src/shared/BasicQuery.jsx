import { ethers } from 'ethers'
import {setGlobalState, useGlobalState} from './dataStore'
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
    // const provider = new ethers.AlchemyProvider("goerli", "EUL_b0M4xTEMnUpJvDAZpSdRJQiKNWid");
    // const signer = new ethers.Wallet("8db49dd3304778a40cc33e17a7427bdf7aee01d5be385029f848579399f109cc", provider)
    // const contract = new ethers.Contract(
    //     contractAddress,
    //     contractAbi,
    //     signer
    // )
    const provider = new ethers.AlchemyProvider("sepolia", "UNdIZtG0dqvQktAMq3ABxntm1eAu-mXL");
    const signer = new ethers.Wallet("899bce550bd4c981b5ca2a9bff04bc68ef4a5bf83a9448bca7056e2b0429e3ad", provider)
    const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
    )
    return contract
}

async function getBalance(connectedAccount) {
    if (!connectedAccount) {
        return 0;
    } else {
        const provider = new ethers.AlchemyProvider("sepolia", "UNdIZtG0dqvQktAMq3ABxntm1eAu-mXL");
        const wei_balance = await provider.getBalance("0x613A19b991292b973e1E8e01C12280961aCd997A");
        const eth_balance = ethers.formatEther(wei_balance);
        return eth_balance;
    }
}

export {
    getContract,
    isWalletConnected,
    connectWallet,
    getBalance,
}