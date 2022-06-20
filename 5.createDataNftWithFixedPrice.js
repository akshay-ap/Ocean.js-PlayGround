const {
  NftFactory
} = require('@oceanprotocol/lib');
const Web3 = require('web3');

const { provider, addresses } = require('./config');

const web3 = new Web3(provider);
const factory = new NftFactory(addresses.ERC721Factory, web3);

const createDataNftWithFixedPrice = async () => {
  const accounts = await web3.eth.getAccounts();
  const publisherAccount = accounts[0];

  const nftParams = {
    name: 'testNFT',
    symbol: 'TST',
    templateIndex: 1,
    tokenURI: ''
  };

  const erc20Params = {
    templateIndex: 1,
    cap: '100000',
    feeAmount: '0',
    feeManager: '0x0000000000000000000000000000000000000000',
    feeToken: '0x0000000000000000000000000000000000000000',
    minter: publisherAccount,
    mpFeeAddress: '0x0000000000000000000000000000000000000000'
  };

  const fixedPriceParams = {
    fixedRateAddress: addresses.FixedPrice,
    baseTokenAddress: addresses.MockDAI,
    owner: accounts[0],
    marketFeeCollector: accounts[0],
    baseTokenDecimals: 18,
    datatokenDecimals: 18,
    fixedRate: '1',
    marketFee: '0',
    allowedConsumer: accounts[0],
    withMint: false
  };

  const bundleNFT = await factory.createNftErc20WithFixedRate(
    accounts[0],
    nftParams,
    erc20Params,
    fixedPriceParams
  );

  const nftAddress = bundleNFT.events.NFTCreated.returnValues[0];
  const datatokenAddress = bundleNFT.events.TokenCreated.returnValues[0];
  const fixedPrice = bundleNFT.events.NewFixedRate.returnValues[0];

  return { nftAddress, datatokenAddress, fixedPrice };
};

createDataNftWithFixedPrice()
  .then(({ nftAddress, datatokenAddress, fixedPrice }) => {
    console.log(`Datatoken address: ${datatokenAddress}`);
    console.log(`DataNFT address: ${nftAddress}`);
    console.log(`Fixed Price: ${fixedPrice}`);

    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
