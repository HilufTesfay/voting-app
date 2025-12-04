'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import contractABI from '../../artifacts/contracts/WeightedVoting.sol/WeightedVoting.json'

const VotingContext = createContext()

export function VotingProvider({ children }) {
    const [account, setAccount] = useState('')
    const [contract, setContract] = useState(null)
    const [isAdmin, setIsAdmin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [network, setNetwork] = useState('')
    const [balance, setBalance] = useState('')

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"


    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                setLoading(true)
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                })
                setAccount(accounts[0])
                await setupContract()
                await getNetwork()
                await getBalance(accounts[0])
            } catch (error) {
                console.error('Connection error:', error)
                alert('Failed to connect wallet: ' + error.message)
            } finally {
                setLoading(false)
            }
        } else {
            alert('Please install MetaMask!')
            window.open('https://metamask.io/download/', '_blank')
        }
    }

    const setupContract = async () => {
        if (typeof window.ethereum !== 'undefined' && contractAddress) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum)
                const signer = await provider.getSigner()
                const votingContract = new ethers.Contract(
                    contractAddress,
                    contractABI.abi,
                    signer
                )

                setContract(votingContract)

                // Check if user is admin
                const adminAddress = await votingContract.admin()
                const currentAddress = await signer.getAddress()
                setIsAdmin(adminAddress.toLowerCase() === currentAddress.toLowerCase())
            } catch (error) {
                console.error('Contract setup error:', error)
            }
        }
    }

    const getNetwork = async () => {
        if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const network = await provider.getNetwork()
            setNetwork(network.name)
        }
    }

    const getBalance = async (address) => {
        if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const balance = await provider.getBalance(address)
            setBalance(ethers.formatEther(balance))
        }
    }

    const disconnectWallet = () => {
        setAccount('')
        setContract(null)
        setIsAdmin(true)
        setNetwork('')
        setBalance('')
    }

    useEffect(() => {
        if (typeof window.ethereum !== 'undefined') {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length === 0) {
                    disconnectWallet()
                } else {
                    setAccount(accounts[0])
                    setupContract()
                    getBalance(accounts[0])
                }
            }

            const handleChainChanged = () => {
                window.location.reload()
            }

            window.ethereum.on('accountsChanged', handleAccountsChanged)
            window.ethereum.on('chainChanged', handleChainChanged)

            // Check if already connected
            window.ethereum.request({ method: 'eth_accounts' })
                .then(async (accounts) => {
                    if (accounts.length > 0) {
                        setAccount(accounts[0])
                        await setupContract()
                        await getNetwork()
                        await getBalance(accounts[0])
                    }
                })

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
                window.ethereum.removeListener('chainChanged', handleChainChanged)
            }
        }
    }, [])

    const value = {
        account,
        contract,
        isAdmin,
        loading,
        network,
        balance,
        connectWallet,
        disconnectWallet,
        refreshData: () => {
            if (account) {
                getBalance(account)
                setupContract()
            }
        }
    }

    return (
        <VotingContext.Provider value={value}>
            {children}
        </VotingContext.Provider>
    )
}

export const useVoting = () => useContext(VotingContext)