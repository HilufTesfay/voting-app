import assert from "node:assert/strict";
import { describe, it, before } from "node:test";

import { network } from "hardhat";

// Test suite for the WeightedVoting contract using viem and node:test
describe("WeightedVoting", async function () {
  // 1. Connect to the Hardhat network and get viem objects
  const { viem } = await network.connect();

  // 2. Get wallet clients for different roles (Hardhat accounts)
  const [adminWallet, voter1Wallet, voter2Wallet, nonVoterWallet] = await viem.getWalletClients();

  // 3. Extract addresses for easy use in transactions
  const admin = adminWallet.account.address;
  const voter1 = voter1Wallet.account.address;
  const voter2 = voter2Wallet.account.address;
  const nonVoter = nonVoterWallet.account.address;

  // Helper function to deploy and set up the contract state
  async function deployAndSetup() {
    // Deploy the contract
    const votingContract = await viem.deployContract("WeightedVoting");

    // Setup initial state: whitelisting two users with weights
    await votingContract.write.whitelistVoter([voter1, 5n], { account: admin });
    await votingContract.write.whitelistVoter([voter2, 10n], { account: admin });

    return votingContract;
  }

  // --- TEST SUITE 1: ADMIN & SETUP ---
  describe("Admin Control and Whitelisting", function () {
    let voting: any;

    before(async () => {
      // Deploy a fresh contract instance before running these tests
      voting = await deployAndSetup();
    });

    it("Should confirm the deployer is set as the admin", async function () {
      const contractAdmin = await voting.read.admin();
      assert.equal(contractAdmin, admin);
    });

    it("Should allow the admin to create a proposal", async function () {
      await voting.write.createProposal(["Launch new product line"], { account: admin });
      const proposalsCount = await voting.read.getProposalsCount();
      // We expect the count to be 1 (index 0)
      assert.equal(proposalsCount, 1n);
    });

    it("Should revert if a non-admin tries to whitelist a voter", async function () {
      // viem.assertions.revertedWith is the viem equivalent of chai's .to.be.revertedWith
      await viem.assertions.revertWith(
        voting.write.whitelistVoter([nonVoter, 1n], { account: nonVoter }),
        "Only admin can call this",
      );
    });

    it("Should correctly store the voter's weight", async function () {
      const voterData = await voting.read.voters([voter2]);
      // voterData is a tuple: [weight, hasVoted, isWhitelisted]
      const weight = voterData[0];
      const isWhitelisted = voterData[2];

      assert.equal(weight, 10n);
      assert.equal(isWhitelisted, true);
    });
  });

  // --- TEST SUITE 2: CORE VOTING LOGIC ---
  describe("Voting and Weight Tallying", function () {
    let voting: any;
    const PROPOSAL_ID = 0n;

    before(async () => {
      voting = await deployAndSetup();
      // Create and start voting for this test suite
      await voting.write.createProposal(["Approve Budget for Q4"], { account: admin });
      await voting.write.startVoting({ account: admin });
    });

    it("Should correctly tally weighted votes for a proposal (Voter 1: 5 votes FOR)", async function () {
      // Voter 1 (weight 5n) votes FOR
      await voting.write.vote([PROPOSAL_ID, true], { account: voter1 });

      // [name, totalCast, forVotes, againstVotes]
      const [, totalCast, forVotes, againstVotes] = await voting.read.getProposal([PROPOSAL_ID]);

      assert.equal(totalCast, 5n);
      assert.equal(forVotes, 5n);
      assert.equal(againstVotes, 0n);
    });

    it("Should correctly tally multiple weighted votes (Voter 2: 10 votes AGAINST)", async function () {
      // This test is run after the previous one in this block, so Voter 1 has already voted (5 FOR)
      // We only need Voter 2 to vote AGAINST
      // Voter 2 (weight 10n) votes AGAINST
      await voting.write.vote([PROPOSAL_ID, false], { account: voter2 });

      // [name, totalCast, forVotes, againstVotes]
      const [, totalCast, forVotes, againstVotes] = await voting.read.getProposal([PROPOSAL_ID]);

      // Total cast: 5 (from voter1) + 10 (from voter2) = 15
      assert.equal(totalCast, 15n);
      // For votes: 5 (from voter1)
      assert.equal(forVotes, 5n);
      assert.equal(againstVotes, 10n);
    });

    it("Should revert if a voter tries to vote twice", async function () {
      // Voter 1 already voted in the previous test; attempt to vote again
      await viem.assertions.revertWith(
        voting.write.vote([PROPOSAL_ID, true], { account: voter1 }),
        "Already voted",
      );
    });

    it("Should revert if voting is not active", async function () {
      // End the voting session
      await voting.write.endVoting({ account: admin });

      // Attempt a vote after the session has ended
      // The first check is for whitelisting, which nonVoter fails.
      // We will deploy a fresh contract to isolate the 'Voting is not active' check.
      const freshVoting = await deployAndSetup();
      await freshVoting.write.createProposal(["Test Inactive"], { account: admin });

      // Voting has not started yet (Proposal ID 1n)
      await viem.assertions.revertWith(
        freshVoting.write.vote([1n, true], { account: voter1 }),
        "Voting is not active",
      );
    });

    it("Should revert if a non-whitelisted user tries to vote", async function () {
      // nonVoter was never whitelisted in the setup
      const freshVoting = await deployAndSetup();
      await freshVoting.write.createProposal(["Test Whitelist"], { account: admin });
      await freshVoting.write.startVoting({ account: admin });

      await viem.assertions.revertWith(
        freshVoting.write.vote([1n, true], { account: nonVoter }),
        "Only whitelisted voters can vote",
      );
    });
  });
});