// Import dependencies
require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const { homedir } = require('os');
const { ConfigHelper } = require('@oceanprotocol/lib');

// Get configuration for the given network
let oceanConfig = new ConfigHelper().getConfig(process.env.OCEAN_NETWORK);

// If using local development environment, read the addresses from local file.
// The local deployment address file can be generated using barge.
if (process.env.OCEAN_NETWORK === 'development') {
  const addressData = JSON.parse(
    fs.readFileSync(
      process.env.ADDRESS_FILE
      || `${homedir}/.ocean/ocean-contracts/artifacts/address.json`,
      'utf8'
    )
  );
  const addresses = addressData[process.env.OCEAN_NETWORK];

  oceanConfig = {
    ...oceanConfig,
    oceanTokenAddress: addresses.Ocean,
    poolTemplateAddress: addresses.poolTemplate,
    fixedRateExchangeAddress: addresses.FixedPrice,
    dispenserAddress: addresses.Dispenser,
    erc721FactoryAddress: addresses.ERC721Factory,
    sideStakingAddress: addresses.Staking,
    opfCommunityFeeCollector: addresses.OPFCommunityFeeCollector
  };
}

oceanConfig = {
  ...oceanConfig,
  nodeUri: process.env.OCEAN_NETWORK_URL,
  // Set optional properties - Provider URL and Aquarius URL
  metadataCacheUri: process.env.AQUARIUS_URL || oceanConfig.metadataCacheUri,
  providerUri: process.env.PROVIDER_URL || oceanConfig.providerUri
};

const web3Provider = new HDWalletProvider(
  process.env.PRIVATE_KEY,
  oceanConfig.nodeUri
);

module.exports = {
  web3Provider,
  oceanConfig
};
