'use client'
import { useState } from 'react'
import { useVoting } from '../context/VotingContext'
import Navbar from '../components/Navbar'
import AdminPanel from '../components/AdminPanel'
import VoterPanel from '../components/VoterPanel'
import Proposals from '../components/Proposals'
import WalletConnect from '../components/WalletConnect'

export default function Home() {
    const { account, isAdmin } = useVoting()
    const [activeTab, setActiveTab] = useState('proposals')

    if (!account) {
        return <WalletConnect />
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    {activeTab === 'proposals' && <Proposals />}
                    {activeTab === 'admin' && isAdmin && <AdminPanel />}
                    {activeTab === 'voter' && <VoterPanel />}
                    {activeTab === 'admin' && !isAdmin && (
                        <div className="text-center py-8">
                            <h3 className="text-xl font-semibold text-red-600">Access Denied</h3>
                            <p className="text-gray-600 mt-2">You are not the administrator</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}