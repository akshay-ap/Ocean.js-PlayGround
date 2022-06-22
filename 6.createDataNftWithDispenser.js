const {
  NftFactory,
  ZERO_ADDRESS
} = require('@oceanprotocol/lib');
const Web3 = require('web3');

const { provider, addresses } = require('./config');

const web3 = new Web3(provider);
const factory = new NftFactory(addresses.ERC721Factory, web3);

const createDataNftWithDispenser = async () => {
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

  const dispenserParams = {
    dispenserAddress: addresses.Dispenser,
    maxTokens: web3.utils.toWei('1'),
    maxBalance: web3.utils.toWei('1'),
    withMint: true,
    allowedSwapper: ZERO_ADDRESS
  };

  const bundleNFT = await factory.createNftErc20WithDispenser(
    accounts[0],
    nftParams,
    erc20Params,
    dispenserParams
  );

  const nftAddress = bundleNFT.events.NFTCreated.returnValues[0];
  const datatokenAddress = bundleNFT.events.TokenCreated.returnValues[0];
  const dispenserAddress = bundleNFT.events.DispenserCreated.returnValues[0];

  return { nftAddress, datatokenAddress, dispenserAddress };
};

createDataNftWithDispenser()
  .then(({ nftAddress, datatokenAddress, dispenserAddress }) => {
    console.log(`Datatoken address: ${datatokenAddress}`);
    console.log(`DataNFT address: ${nftAddress}`);
    console.log(`Dispenser address: ${dispenserAddress}`);

    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
