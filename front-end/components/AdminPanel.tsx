'use client'

import { useState } from 'react'
import { useVoting } from '../context/VotingContext'

export default function AdminPanel() {
    const { contract, refreshData } = useVoting()
    const [formData, setFormData] = useState({
        voterAddress: '',
        weight: '',
        proposalDesc: ''
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const whitelistVoter = async (e) => {
        e.preventDefault()
        if (!contract) return

        try {
            setLoading(true)
            const tx = await contract.whitelistVoter(formData.voterAddress, parseInt(formData.weight))
            await tx.wait()

            alert('✅ Voter whitelisted successfully!')
            setFormData({ ...formData, voterAddress: '', weight: '' })
            refreshData()
        } catch (error) {
            console.error(error)
            alert('❌ Error whitelisting voter: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const createProposal = async (e) => {
        e.preventDefault()
        if (!contract) return

        try {
            setLoading(true)
            const tx = await contract.createProposal(formData.proposalDesc)
            await tx.wait()

            alert('✅ Proposal created successfully!')
            setFormData({ ...formData, proposalDesc: '' })
            refreshData()
        } catch (error) {
            console.error(error)
            alert('❌ Error creating proposal: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const startVoting = async () => {
        if (!contract) return

        try {
            setLoading(true)
            const tx = await contract.startVoting()
            await tx.wait()
            alert('✅ Voting started!')
            refreshData()
        } catch (error) {
            console.error(error)
            alert('❌ Error starting voting: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const endVoting = async () => {
        if (!contract) return

        try {
            setLoading(true)
            const tx = await contract.endVoting()
            await tx.wait()
            alert('✅ Voting ended!')
            refreshData()
        } catch (error) {
            console.error(error)
            alert('❌ Error ending voting: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Administrator Privileges</span>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Whitelist Voter Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-blue-900">Whitelist Voter</h3>
                    </div>

                    <form onSubmit={whitelistVoter} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Voter Address
                            </label>
                            <input
                                type="text"
                                name="voterAddress"
                                value={formData.voterAddress}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0x..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Voting Weight
                            </label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg  bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min="1"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Higher weight = more voting power</p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? 'Processing...' : 'Whitelist Voter'}
                        </button>
                    </form>
                </div>

                {/* Create Proposal Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-green-900">Create Proposal</h3>
                    </div>

                    <form onSubmit={createProposal} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Proposal Description
                            </label>
                            <textarea
                                name="proposalDesc"
                                value={formData.proposalDesc}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                rows="3"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Create Proposal'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Voting Controls */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-6">Voting Session Controls</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={startVoting}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Start Voting Session</span>
                    </button>
                    <button
                        onClick={endVoting}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                        <span>End Voting Session</span>
                    </button>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                    Start voting to allow whitelisted voters to cast their votes. End voting to close the session and finalize results.
                </p>
            </div>
        </div>
    )
}