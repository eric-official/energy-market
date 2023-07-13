<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project




<!-- GETTING STARTED -->
## Getting Started

How to run the project locally on your laptop

### Frontend 

In order to run the project on your laptop locally, follow the steps:
* Go to the folder `/client` and run all the commands from there. Install the dependencies for the react frontend.
  ```sh
  npm install
  ```
* Start the react frontend server.
  ```sh
  npm start  ```


### Oracle
- Oracle server: all the commands should be run from the follwing folder path: `energy-market/oracleServer`
1. In order to start the frontend to test the oracle server,  and run the following command:
```
node frontend.js
```
2. In order to start the oracle provider, run the following command:
```
npx hardhat run provider --network sepolia 
```
### Smart Contract 

![Oracle Architecture](images/oracle_architecture.png)

Currently for our project, we are using Hardhat as the ethereum development environment. For the development purpose, we are using the sepolia testnet. Everything is automated and already configured through hardhat config files to deploy to the testnet.

All the following commands needs to be executed from the `energy-market/smart-contracts` folder.
- In order to compile your smart contracts:
```sh
 npx hardhat compile
```
- In order to deploy your smart contracts:
```
npx hardhat run scripts/deploy.js --network sepolia

```
- Next, you have to update the `oracleServer/provider/electricityDataOracleABI.json` and `oracleServer/frontend/callerABI.js` with the new ABI generated after the deployment. It can be found here: `smart-contracts/artifacts/contracts/energyContracts/`

- Update the new contract address in `energy-market/oracleServer/provider/index.js` and `energy-market/oracleServer/frontend/app.js`


