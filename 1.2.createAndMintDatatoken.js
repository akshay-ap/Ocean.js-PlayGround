const { NftFactory, Datatoken } = require('@oceanprotocol/lib');
const Web3 = require('web3');
const { provider, oceanConfig } = require('./config');

const web3 = new Web3(provider);

const createDataNFT = async () => {
  const Factory = new NftFactory(oceanConfig.erc721FactoryAddress, web3);

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

const mintDatatoken = async (datatokenAddress) => {
  const accounts = await web3.eth.getAccounts();
  const publisherAccount = accounts[0];
  const consumerAccount = accounts[1];

  const datatoken = new Datatoken(web3);

  await datatoken.mint(
    datatokenAddress,
    publisherAccount,
    '1',
    consumerAccount
  );
  const consumerBalance = await datatoken.balance(
    datatokenAddress,
    consumerAccount
  );
  console.log(`Consumer balance ${consumerBalance}`);
};

createDataNFT()
  .then(({ erc721Address, datatokenAddress }) => {
    console.log(`DataNft address ${erc721Address}`);
    console.log(`Datatoken address ${datatokenAddress}`);

    mintDatatoken(datatokenAddress)
      .then(() => {
        console.log('Done');
        process.exit((err) => {
          console.error(err);
          process.exit(1);
        });
      })
      .catch();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
