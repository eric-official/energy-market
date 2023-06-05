const hre = require('hardhat')
const fs = require('fs');

const deployContracts = async () => {
  let deployedContracts = {}

  // Deploy ElectricityTradingHub
  const ethFactory = await hre.ethers.getContractFactory('ElectricityTradingHub')
  const ethContract = await ethFactory.deploy()
  await ethContract.deployed()
  deployedContracts["ElectricityTradingHub"] = ethContract.address
  console.log('ElectricityTradingHub deployed to:', ethContract.address)

  // Deploy RenewableProviderPool
  const rppFactory = await hre.ethers.getContractFactory('RenewableProviderPool')
  const rppContract = await rppFactory.deploy()
  await rppContract.deployed()
  deployedContracts["RenewableProviderPool"] = rppContract.address
  console.log('RenewableProviderPool deployed to:', rppContract.address)

  return JSON.stringify(deployedContracts);
}

const runDeployContracts = async () => {
  try {
    return await deployContracts();
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

const awaitDeployContracts = async () => {
  const deployedContracts = await runDeployContracts()
  console.log(deployedContracts)
  fs.writeFile("./scripts/deployedContracts.json", deployedContracts, (error) => {
    if (error) {
      console.error(error);
      throw error;
    }
    console.log("deployedContracts.json written correctly");
  });
}

awaitDeployContracts()