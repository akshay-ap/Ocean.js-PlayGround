// Import dependencies
const { NftFactory } = require('@oceanprotocol/lib');
const Web3 = require('web3');

// Note: Make sure .env file and config.js are created and setup correctly
const { web3Provider, oceanConfig } = require('./config');

const web3 = new Web3(web3Provider);

// Deinfe a function which will create a dataNFT using Ocean.js library
const createDataNFT = async () => {

  // Create a NFTFactory
  const Factory = new NftFactory(oceanConfig.erc721FactoryAddress, web3);

  const accounts = await web3.eth.getAccounts();
  const publisherAccount = accounts[0];

  // Define dataNFT parameters
  const nftParams = {
    name: '72120Bundle',
    symbol: '72Bundle',
    // Optional parameters
    templateIndex: 1,
    tokenURI: 'https://example.com',
    transferable: true,
    owner: publisherAccount
  };

  // Call a Factory.createNFT(...) which will create a new dataNFT
  const erc721Address = await Factory.createNFT(
    publisherAccount,
    nftParams
  );

  return {
    erc721Address
  };
};

// Call the create createDataNFT() function
createDataNFT()
  .then(({ erc721Address }) => {
    console.log(`DataNft address ${erc721Address}`);
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });