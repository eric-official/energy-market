require('@nomiclabs/hardhat-waffle')
module.exports = {
  solidity: '0.8.0',
  networks: {
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/EUL_b0M4xTEMnUpJvDAZpSdRJQiKNWid',
      accounts: [
        '',
      ],
    },
  },
}

// TODO: Create Metamask wallets and insert private key in accounts array