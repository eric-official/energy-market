const wallet = require("ethereumjs-wallet").default;

const addressData = wallet.generate();

console.log(`Private key: ${addressData.getPrivateKeyString()}`);
console.log(`Address: ${addressData.getAddressString()}`);