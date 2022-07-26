const { NftFactory } = require('@oceanprotocol/lib');
const Web3 = require('web3');

const { web3Provider, oceanConfig } = require('./config');

const web3 = new Web3(web3Provider);
const factory = new NftFactory(oceanConfig.erc721FactoryAddress, web3);

const createDataNFTWithPool = async () => {
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

  const poolParams = {
    ssContract: oceanConfig.sideStakingAddress,
    baseTokenAddress: oceanConfig.oceanTokenAddress,
    baseTokenSender: oceanConfig.erc721FactoryAddress,
    publisherAddress: accounts[0],
    marketFeeCollector: accounts[0],
    poolTemplateAddress: oceanConfig.poolTemplateAddress,
    rate: '1',
    baseTokenDecimals: 18,
    vestingAmount: '10000',
    vestedBlocks: 2500000,
    initialBaseTokenLiquidity: '2000',
    swapFeeLiquidityProvider: '0.001',
    swapFeeMarketRunner: '0.001'
  };
  const bundleNFT = await factory.createNftErc20WithPool(
    accounts[0],
    nftParams,
    erc20Params,
    poolParams
  );

  const nftAddress = bundleNFT.events.NFTCreated.returnValues[0];
  const datatokenAddress = bundleNFT.events.TokenCreated.returnValues[0];
  const poolAddress = bundleNFT.events.NewPool.returnValues[0];

  return { nftAddress, datatokenAddress, poolAddress };
};

createDataNFTWithPool()
  .then(({ nftAddress, datatokenAddress, poolAddress }) => {
    console.log(`Datatoken address: ${datatokenAddress}`);
    console.log(`DataNFT address: ${nftAddress}`);
    console.log(`Pool address: ${poolAddress}`);

    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
