import hre from "hardhat";
import { parseEther } from "viem";


async function main() {
    const { viem, networkName } = await hre.network.connect();

    const initialValue = 42n; // Using BigInt literal 'n' for large integers in viem

    console.log(`\nDeploying WeightedVoting to ${networkName} network...`);
    console.log(`Constructor argument (initialValue): ${initialValue}`);

    const weightedVoting = await viem.deployContract(
        "WeightedVoting",
        [initialValue]
    );


    const address = weightedVoting.address;

    console.log(`\n✅ weightedVoting deployed successfully!`);
    console.log(`Contract address: ${address}`);

    const storedValue = await weightedVoting.read.get();
    console.log(`Initial stored data (retrieved via get()): ${storedValue}`);
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});