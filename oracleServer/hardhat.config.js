
require("@nomiclabs/hardhat-waffle");
module.exports = {
  solidity: '0.8.0',
  networks: {
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/EUL_b0M4xTEMnUpJvDAZpSdRJQiKNWid',
      accounts: [
        '7e7460a37206177f34de4206c63018658500c27d9925c3e97c147ec4147f23c2',
      ],
    },
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/zk2yQpcUghNqwg6DiyuhzdIDu5u5_Lb2',
      accounts: [
        '899bce550bd4c981b5ca2a9bff04bc68ef4a5bf83a9448bca7056e2b0429e3ad',
      ],
    },
  },
}

// TODO: Create Metamask wallets and insert private key in accounts array