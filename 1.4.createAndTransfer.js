const { NftFactory, Datatoken } = require('@oceanprotocol/lib');
const Web3 = require('web3');
const { provider, oceanConfig } = require('./config');

const web3 = new Web3(provider);

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

  const result = await Factory.createNftWithErc20(
    publisherAccount,
    nftParams,
    erc20Params
  );

  const erc721Address = result.events.NFTCreated.returnValues[0];
  const datatokenAddress = result.events.TokenCreated.returnValues[0];

  return {
    erc721Address,
    datatokenAddress
  };
};

createDataNFT()
  .then(async ({ erc721Address, datatokenAddress }) => {
    console.log(`DataNft address ${erc721Address}`);
    console.log(`Datatoken address ${datatokenAddress}`);

    const accounts = await web3.eth.getAccounts();
    const alice = accounts[0];
    const bob = accounts[1];

    const datatoken = new Datatoken(web3);

    await datatoken.mint(datatokenAddress, alice, '1', alice);
    await datatoken.transfer(datatokenAddress, bob, '1', alice);

    const bobBalance = await datatoken.balance(datatokenAddress, bob);
    console.log(`Bob balance ${bobBalance}`);

    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
