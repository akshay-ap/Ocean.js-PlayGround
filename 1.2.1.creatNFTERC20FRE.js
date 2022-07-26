const { NftFactory, Datatoken } = require('@oceanprotocol/lib');
const Web3 = require('web3');
const { web3Provider, oceanConfig } = require('./config');

const web3 = new Web3(web3Provider);

const createDataNFT = async () => {
  const Factory = new NftFactory(oceanConfig.erc721FactoryAddress, web3);

  const accounts = await web3.eth.getAccounts();
  const publisherAccount = accounts[0];

  const nftParams = {
    name: '72120Bundle',
    symbol: '72Bundle',
    templateIndex: 1,
    tokenURI: 'https://example.com',
    transferable: true,
    owner: publisherAccount
  };

  const erc20Params = {
    templateIndex: 1,
    cap: '100000',
    feeAmount: '0',
    paymentCollector: '0x0000000000000000000000000000000000000000',
    feeToken: '0x0000000000000000000000000000000000000000',
    minter: publisherAccount,
    mpFeeAddress: '0x0000000000000000000000000000000000000000'
  };

  const fixedPriceParams = {
    fixedRateAddress: oceanConfig.fixedRateExchangeAddress,
    baseTokenAddress: oceanConfig.oceanTokenAddress,
    owner: publisherAccount,
    marketFeeCollector: publisherAccount,
    baseTokenDecimals: 18,
    datatokenDecimals: 18,
    fixedRate: '1',
    marketFee: '0',
    allowedConsumer: publisherAccount,
    withMint: false
  }

  const result = await Factory.createNftErc20WithFixedRate(
    publisherAccount,
    nftParams,
    erc20Params,
    fixedPriceParams
  );

  const erc721Address = result.events.NFTCreated.returnValues[0];
  const datatokenAddress = result.events.TokenCreated.returnValues[0];

  return {
    erc721Address,
    datatokenAddress
  };
};

createDataNFT()
  .then(({ erc721Address, datatokenAddress }) => {
    console.log(`DataNft address ${erc721Address}`);
    console.log(`Datatoken address ${datatokenAddress}`);
    process.exit(1);

  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
