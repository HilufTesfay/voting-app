'use client'

import { useState, useEffect } from 'react'
import { useVoting } from '../context/VotingContext'

export default function VoterPanel() {
    const { contract, account, refreshData } = useVoting()
    const [proposals, setProposals] = useState([])
    const [voterInfo, setVoterInfo] = useState(null)
    const [selectedProposal, setSelectedProposal] = useState('')
    const [voteType, setVoteType] = useState(true)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadData()
    }, [contract])

    const loadData = async () => {
        if (!contract) return

        try {
            setLoading(true)
            // Load proposals
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

            // Load voter info
            const info = await contract.getVoterInfo(account)
            setVoterInfo({
                isWhitelisted: info[0],
                weight: info[1].toString(),
                hasVoted: info[2],
                votedProposal: info[3].toString()
            })
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const castVote = async () => {
        if (!contract) return

        try {
            setLoading(true)
            const tx = await contract.vote(parseInt(selectedProposal), voteType)
            await tx.wait()

            alert('✅ Vote cast successfully!')
            refreshData()
            loadData()
            setSelectedProposal('')
        } catch (error) {
            console.error(error)
            alert('❌ Error casting vote: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading && !voterInfo) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!voterInfo?.isWhitelisted) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Not Whitelisted</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                    You are not currently whitelisted as a voter. Please contact the administrator to get added to the voter list.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Voter Info Card */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Your Voting Dashboard</h2>
                        <p className="text-blue-100">Participate in governance decisions</p>
                    </div>
                    <div className="mt-4 md:mt-0 bg-white/20 backdrop-blur-sm rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="text-sm text-blue-100">Voting Power</div>
                                <div className="text-2xl font-bold">{voterInfo.weight}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-blue-100">Status</div>
                                <div className={`text-lg font-semibold ${voterInfo.hasVoted ? 'text-green-300' : 'text-yellow-300'}`}>
                                    {voterInfo.hasVoted ? 'Voted' : 'Ready to Vote'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Voting Interface */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Cast Your Vote</h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Select Proposal
                        </label>
                        <div className="space-y-3">
                            {proposals.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No proposals available for voting
                                </div>
                            ) : (
                                proposals.map((proposal) => (
                                    <div key={proposal.id} className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            id={`proposal-${proposal.id}`}
                                            name="proposal"
                                            value={proposal.id}
                                            checked={selectedProposal === proposal.id.toString()}
                                            onChange={(e) => setSelectedProposal(e.target.value)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor={`proposal-${proposal.id}`} className="flex-1 cursor-pointer">
                                            <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-colors">
                                                <div className="font-medium text-gray-900">Proposal #{proposal.id + 1}</div>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{proposal.description}</p>
                                            </div>
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {selectedProposal && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Your Vote
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setVoteType(true)}
                                        className={`p-4 rounded-lg border-2 transition-all ${voteType ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300'}`}
                                    >
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${voteType ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="font-medium">Vote For</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setVoteType(false)}
                                        className={`p-4 rounded-lg border-2 transition-all ${!voteType ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-red-300'}`}
                                    >
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!voteType ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </div>
                                            <span className="font-medium">Vote Against</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-sm text-gray-600">Selected Proposal</div>
                                        <div className="font-medium">
                                            Proposal #{parseInt(selectedProposal) + 1}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-600">Your Voting Power</div>
                                        <div className="text-xl font-bold text-blue-600">{voterInfo.weight}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={castVote}
                                    disabled={loading || voterInfo.hasVoted}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Processing Vote...</span>
                                        </>
                                    ) : voterInfo.hasVoted ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Already Voted</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Cast Your Vote</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}