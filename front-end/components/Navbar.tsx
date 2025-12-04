'use client'

import { useVoting } from '../context/VotingContext'
import { useState } from 'react'

export default function Navbar({ activeTab, setActiveTab }) {
    const { account, network, balance, disconnectWallet } = useVoting()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const truncateAddress = (address) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
                            <span className="text-xl font-bold text-gray-900">VoteChain</span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <button
                            onClick={() => setActiveTab('proposals')}
                            className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'proposals' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Proposals
                        </button>
                        <button
                            onClick={() => setActiveTab('voter')}
                            className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'voter' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Voter Panel
                        </button>
                        <button
                            onClick={() => setActiveTab('admin')}
                            className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'admin' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Admin Panel
                        </button>
                    </div>

                    {/* Wallet Info */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{truncateAddress(account)}</div>
                            <div className="text-xs text-gray-500">{network} • {parseFloat(balance).toFixed(4)} ETH</div>
                        </div>
                        <button
                            onClick={disconnectWallet}
                            className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            Disconnect
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 py-4">
                        <div className="flex flex-col space-y-3">
                            <button
                                onClick={() => {
                                    setActiveTab('proposals')
                                    setIsMobileMenuOpen(false)
                                }}
                                className={`px-4 py-2 rounded-lg text-left ${activeTab === 'proposals' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                            >
                                Proposals
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('voter')
                                    setIsMobileMenuOpen(false)
                                }}
                                className={`px-4 py-2 rounded-lg text-left ${activeTab === 'voter' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                            >
                                Voter Panel
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('admin')
                                    setIsMobileMenuOpen(false)
                                }}
                                className={`px-4 py-2 rounded-lg text-left ${activeTab === 'admin' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                            >
                                Admin Panel
                            </button>
                            <div className="pt-4 border-t border-gray-200">
                                <div className="text-sm text-gray-600 mb-2">
                                    <div className="font-medium">{truncateAddress(account)}</div>
                                    <div className="text-xs">{network} • {parseFloat(balance).toFixed(4)} ETH</div>
                                </div>
                                <button
                                    onClick={disconnectWallet}
                                    className="w-full px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                >
                                    Disconnect Wallet
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}