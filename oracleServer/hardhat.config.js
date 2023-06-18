
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
      url: 'https://eth-sepolia.g.alchemy.com/v2/UNdIZtG0dqvQktAMq3ABxntm1eAu-mXL',
      accounts: [
        '7e7460a37206177f34de4206c63018658500c27d9925c3e97c147ec4147f23c2',
      ],
    },
  },
}

// TODO: Create Metamask wallets and insert private key in accounts array