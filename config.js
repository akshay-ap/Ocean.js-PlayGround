require('dotenv').config()
const HDWalletProvider = require("@truffle/hdwallet-provider");
const fs = require("fs");
const { homedir } = require('os');
const { ConfigHelper } = require("@oceanprotocol/lib");

const networkUrl = process.env.networkUrl
const provider = new HDWalletProvider(process.env.MNEMONIC, networkUrl);

const addressData = JSON.parse(
  fs.readFileSync(
    process.env.ADDRESS_FILE ||
    `${homedir}/.ocean/ocean-contracts/artifacts/address.json`,
    'utf8'
  )
)

const addresses = addressData[process.env.OCEAN_NETWORK]

const urls = {
  networkUrl: networkUrl,
  aquarius: process.env.aquarius,
  providerUrl: process.env.providerUrl
};

module.exports = {
  urls,
  provider,
  addresses
};

