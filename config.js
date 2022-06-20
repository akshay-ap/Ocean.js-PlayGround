require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const { homedir } = require('os');
const { ConfigHelper } = require('@oceanprotocol/lib');

let oceanConfig = new ConfigHelper().getConfig(process.env.OCEAN_NETWORK);

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
  metadataCacheUri: process.env.AQUARIUS_URL,
  nodeUri: process.env.NETWORK_URL,
  providerUri: process.env.PROVIDER_URL
};

const provider = new HDWalletProvider(
  process.env.MNEMONIC,
  oceanConfig.nodeUri
);

module.exports = {
  provider,
  oceanConfig
};
