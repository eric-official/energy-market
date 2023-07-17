const hre = require('hardhat')
const fs = require('fs');
const path = "./scripts/deployedContracts.json";


const deployContracts = async () => {
  let deployedContracts = {}

    // Deploy Caller
  const callerFactory = await hre.ethers.getContractFactory('Caller')
  const callerContract = await callerFactory.deploy()
  await callerContract.deployed()
  deployedContracts["Caller"] = callerContract.address
  console.log('Caller deployed to:', callerContract.address)

      // Deploy Oracle
  const oracleFactory = await hre.ethers.getContractFactory('ElectricityDataOracle')
  const oracleContract = await oracleFactory.deploy()
  await oracleContract.deployed()
  deployedContracts["ElectricityDataOracle"] = oracleContract.address
  console.log('ElectricityDataOracle deployed to:', oracleContract.address)

  // Deploy ElectricityHub contract with the initial caller contract deployed address
  const hubFactory = await hre.ethers.getContractFactory('ElectricityHub')
  const hubContract = await hubFactory.deploy(callerContract.address)
  await hubContract.deployed()
  deployedContracts["ElectricityHub"] = hubContract.address
  console.log('ElectricityHub deployed to:', hubContract.address)

  // Call the setElectricityOracleAddress function on the Caller contract
  await callerContract.setElectricityOracleAddress(oracleContract.address)

  // Get the deployer's account
  const [deployerAccount] = await hre.ethers.getSigners();

  // Call the addProvider function on the ElectricityDataOracle contract
  await oracleContract.addProvider(deployerAccount.address)
  
  return deployedContracts;
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
  const newDeployedContracts = await runDeployContracts()
  let deployedContracts = {};
  console.log("newDeployedContracts",newDeployedContracts)

  // Check if file already exists
  if(fs.existsSync(path)) {
    // Read the file
    let rawdata = fs.readFileSync(path);
    deployedContracts = JSON.parse(rawdata);
  }

  // Merge new contracts
  deployedContracts = { ...deployedContracts, ...newDeployedContracts };
  
  // Save to the file
  fs.writeFileSync(path, JSON.stringify(deployedContracts), (error) => {
    if (error) {
      console.error(error);
      throw error;
    }
    console.log("deployedContracts.json written correctly");
  });
}

awaitDeployContracts()