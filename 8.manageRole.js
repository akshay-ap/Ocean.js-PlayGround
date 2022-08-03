const { Nft } = require('@oceanprotocol/lib');
const Web3 = require('web3');

// Note: Make sure .env file and config.js are created and setup correctly
const { web3Provider, oceanConfig } = require('./config');

const web3 = new Web3(web3Provider);

const mangeRole = async () => {
    // did:op:41726160b692e234d59e1611e1f7177e3f1ca0620a41867c53c0660ee9d017e6
    const nftAddress = "0x016EcBd813f73F2583509A0377F635C14D64c136";
    const accounts = await web3.eth.getAccounts();
    const publisherAccount = accounts[0];
    const chain = await web3.eth.getChainId();
    const nftDatatoken = new Nft(web3, chain)
    await nftDatatoken.addManager(nftAddress, publisherAccount, publisherAccount)
}

mangeRole().then(() => {
    process.exit(0);
}).catch((err) => {
    console.error(err);
    process.exit(1);
});