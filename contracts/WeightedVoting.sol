// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract WeightedVoting {
    struct Voter {
        bool isWhitelisted;
        uint256 weight;
        bool hasVoted;
        uint256 votedProposal;
    }

    struct Proposal {
        string description;
        uint256 voteCount;
        uint256 forVotes;
        uint256 againstVotes;
    }

    address public admin;
    Proposal[] public proposals;

    mapping(address => Voter) public voters;
    address[] public voterAddresses;

    enum VotingStatus {
        Pending,
        Active,
        Closed
    }
    VotingStatus public status;

    event VoterWhitelisted(address voter, uint256 weight);
    event VoteCast(address voter, uint256 proposalId, uint256 weight);
    event ProposalCreated(string description);
    event VotingStatusChanged(VotingStatus status);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    modifier onlyWhitelisted() {
        require(voters[msg.sender].isWhitelisted, "Not whitelisted");
        _;
    }

    modifier votingActive() {
        require(status == VotingStatus.Active, "Voting is not active");
        _;
    }

    constructor() {
        admin = msg.sender;
        status = VotingStatus.Pending;
    }

    function whitelistVoter(address _voter, uint256 _weight) public onlyAdmin {
        require(!voters[_voter].isWhitelisted, "Already whitelisted");
        require(_weight > 0, "Weight must be > 0");

        voters[_voter] = Voter({
            isWhitelisted: true,
            weight: _weight,
            hasVoted: false,
            votedProposal: 0
        });

        voterAddresses.push(_voter);
        emit VoterWhitelisted(_voter, _weight);
    }

    function createProposal(string memory _description) public onlyAdmin {
        proposals.push(
            Proposal({
                description: _description,
                voteCount: 0,
                forVotes: 0,
                againstVotes: 0
            })
        );

        emit ProposalCreated(_description);
    }

    function startVoting() public onlyAdmin {
        status = VotingStatus.Active;
        emit VotingStatusChanged(status);
    }

    function endVoting() public onlyAdmin {
        status = VotingStatus.Closed;
        emit VotingStatusChanged(status);
    }

    function vote(
        uint256 _proposalId,
        bool _support
    ) public onlyWhitelisted votingActive {
        Voter storage sender = voters[msg.sender];
        require(!sender.hasVoted, "Already voted");
        require(_proposalId < proposals.length, "Invalid proposal");

        Proposal storage proposal = proposals[_proposalId];

        sender.hasVoted = true;
        sender.votedProposal = _proposalId;
        proposal.voteCount += sender.weight;

        if (_support) {
            proposal.forVotes += sender.weight;
        } else {
            proposal.againstVotes += sender.weight;
        }

        emit VoteCast(msg.sender, _proposalId, sender.weight);
    }

    // View functions
    function getProposalsCount() public view returns (uint256) {
        return proposals.length;
    }

    function getProposal(
        uint256 _proposalId
    )
        public
        view
        returns (
            string memory description,
            uint256 voteCount,
            uint256 forVotes,
            uint256 againstVotes
        )
    {
        require(_proposalId < proposals.length, "Invalid proposal");
        Proposal storage p = proposals[_proposalId];
        return (p.description, p.voteCount, p.forVotes, p.againstVotes);
    }

    function getVoterInfo(
        address _voter
    )
        public
        view
        returns (
            bool isWhitelisted,
            uint256 weight,
            bool hasVoted,
            uint256 votedProposal
        )
    {
        Voter storage v = voters[_voter];
        return (v.isWhitelisted, v.weight, v.hasVoted, v.votedProposal);
    }

    function getVoterCount() public view returns (uint256) {
        return voterAddresses.length;
    }
}
