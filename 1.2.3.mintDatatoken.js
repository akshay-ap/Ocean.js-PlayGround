const { NftFactory, Datatoken } = require('@oceanprotocol/lib');
const Web3 = require('web3');
const { web3Provider, oceanConfig } = require('./config');

const web3 = new Web3(web3Provider);

const mintDatatoken = async (datatokenAddress, receiverAddress) => {
  const accounts = await web3.eth.getAccounts();
  const publisherAccount = accounts[0];

  const datatoken = new Datatoken(web3);

  let receiverBalance = await datatoken.balance(
    datatokenAddress,
    receiverAddress
  );
  console.log(`Receiver balance before mint: ${receiverBalance}`);

  await datatoken.mint(
    datatokenAddress,
    publisherAccount,
    '1',
    receiverAddress
  );

  receiverBalance = await datatoken.balance(
    datatokenAddress,
    receiverAddress
  );
  console.log(`Receiver balance after mint: ${receiverBalance}`);
};

const datatokenAddress = "0xD3542e5F56655fb818F9118CE219e1D10751BC82"
const receiverAddress = "0xBE5449a6A97aD46c8558A3356267Ee5D2731ab5e"

mintDatatoken(datatokenAddress, receiverAddress)
  .then(() => {
    process.exit((err) => {
      console.error(err);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });


