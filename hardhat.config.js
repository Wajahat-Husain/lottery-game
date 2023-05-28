require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();


task("accounts", "Prints the list of accounts", async () => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  mocha: {
    timeout: 10000000000,
  },
  solidity:{
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};