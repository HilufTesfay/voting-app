import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const WeightedVotingModule = buildModule("WeightedVotingModule", (m) => {
  const weightedVoting = m.contract("WeightedVoting");

  return { weightedVoting };
});

export default WeightedVotingModule;