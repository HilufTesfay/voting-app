'use client'

import { useState, useEffect } from 'react'
import { useVoting } from '../context/VotingContext'

export default function Proposals() {
    const { contract } = useVoting()
    const [proposals, setProposals] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadProposals()
    }, [contract])

    const loadProposals = async () => {
        if (!contract) return

        try {
            setLoading(true)
            const count = await contract.getProposalsCount()
            const proposalsArray = []

            for (let i = 0; i < count; i++) {
                const proposal = await contract.getProposal(i)
                proposalsArray.push({
                    id: i,
                    description: proposal[0],
                    voteCount: proposal[1].toString(),
                    forVotes: proposal[2].toString(),
                    againstVotes: proposal[3].toString()
                })
            }

            setProposals(proposalsArray)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mt-2"></div>
                    </div>
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="grid gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white border rounded-lg p-6 shadow-sm animate-pulse">
                            <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
                            <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (proposals.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Proposals Yet</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                    There are no proposals created yet. Administrators can create proposals to start the voting process.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Active Proposals</h2>
                    <p className="text-gray-600 mt-1">View and track all governance proposals</p>
                </div>
                <button
                    onClick={loadProposals}
                    className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            <div className="grid gap-6">
                {proposals.map((proposal) => {
                    const totalVotes = parseInt(proposal.forVotes) + parseInt(proposal.againstVotes)
                    const forPercentage = totalVotes > 0 ? (parseInt(proposal.forVotes) / totalVotes) * 100 : 0
                    const againstPercentage = totalVotes > 0 ? (parseInt(proposal.againstVotes) / totalVotes) * 100 : 0

                    return (
                        <div key={proposal.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                                                Proposal #{proposal.id + 1}
                                            </span>
                                            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded-full">
                                                Total Votes: {proposal.voteCount}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                                        <p className="text-gray-700 leading-relaxed">{proposal.description}</p>
                                    </div>

                                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 min-w-[200px]">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-900">{proposal.voteCount}</div>
                                            <div className="text-sm text-blue-700">Total Voting Power</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Voting Results */}
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span className="font-medium text-green-600">
                                                For: {proposal.forVotes} ({forPercentage.toFixed(1)}%)
                                            </span>
                                            <span>{parseInt(proposal.forVotes).toLocaleString()} votes</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${forPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span className="font-medium text-red-600">
                                                Against: {proposal.againstVotes} ({againstPercentage.toFixed(1)}%)
                                            </span>
                                            <span>{parseInt(proposal.againstVotes).toLocaleString()} votes</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-red-500 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${againstPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {parseInt(proposal.forVotes).toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-600">For Votes</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {parseInt(proposal.againstVotes).toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-600">Against Votes</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {(parseInt(proposal.forVotes) + parseInt(proposal.againstVotes)).toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-600">Total Votes</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}