require('dotenv').config()
const networkUrl = process.env.networkUrl
const aquarius = process.env.aquarius
const providerUri = process.env.providerUri

const urls = {
  networkUrl: networkUrl,
  aquarius: aquarius,
  providerUri: providerUri,
};

const walletConfig = {
  mnemonic: process.env.MNEMONIC,
  rpc: networkUrl,
};

module.exports = {
  urls,
  walletConfig
};
