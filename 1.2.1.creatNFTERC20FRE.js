// Import dependencies
const { NftFactory, Datatoken, Nft } = require('@oceanprotocol/lib');
const Web3 = require('web3');
const { web3Provider, oceanConfig } = require('./config');
const { SHA256 } = require('crypto-js');

// Create a web3 instance
const web3 = new Web3(web3Provider);

// Define a function createFRE()
const createFRE = async () => {
  const Factory = new NftFactory(oceanConfig.erc721FactoryAddress, web3);

  // Get accounts from web3 instance
  const accounts = await web3.eth.getAccounts();
  const publisherAccount = accounts[0];

  // data NFT parameters: name, symbol, templateIndex, etc.
  const nftParams = {
    name: '72120Bundle',
    symbol: '72Bundle',
    templateIndex: 1,
    tokenURI: 'https://example.com',
    transferable: true,
    owner: publisherAccount
  };

  // datatoken parameters: name, symbol, templateIndex, etc.
  const erc20Params = {
    name: "Sample datatoken",
    symbol: "SDT",
    templateIndex: 1,
    cap: '100000',
    feeAmount: '0',
    paymentCollector: publisherAccount,
    feeToken: publisherAccount,
    minter: publisherAccount,
    mpFeeAddress: publisherAccount
  };

  const fixedPriceParams = {
    fixedRateAddress: oceanConfig.fixedRateExchangeAddress,
    baseTokenAddress: oceanConfig.oceanTokenAddress,
    owner: publisherAccount,
    marketFeeCollector: publisherAccount,
    baseTokenDecimals: 18,
    datatokenDecimals: 18,
    fixedRate: '100',
    marketFee: '0',
    // Optional parameters
    // allowedConsumer: publisherAccount,  //  only account that consume the exhchange
    withMint: false // add FixedPriced contract as minter if withMint == true
  }

  // Create data NFT and a datatoken with Fixed Rate exchange
  const result = await Factory.createNftErc20WithFixedRate(
    publisherAccount,
    nftParams,
    erc20Params,
    fixedPriceParams
  );

  // Get the data NFT address and datatoken address from the result
  const erc721Address = result.events.NFTCreated.returnValues[0];
  const datatokenAddress = result.events.TokenCreated.returnValues[0];

  const chain = await web3.eth.getChainId();
  const nftDatatoken = new Nft(web3, chain)
  await nftDatatoken.addManager(erc721Address, publisherAccount, publisherAccount)


  return {
    erc721Address,
    datatokenAddress
  };
};

// Call the createFRE() function 
createFRE()
  .then(({ erc721Address, datatokenAddress }) => {
    console.log(`DataNft address ${erc721Address}`);
    console.log(`Datatoken address ${datatokenAddress}`);

    web3.eth.getChainId().then(chainId => {
      console.log(`did:op:${SHA256(web3.utils.toChecksumAddress(erc721Address) + chainId.toString(10))}`);

      process.exit(1);

    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });