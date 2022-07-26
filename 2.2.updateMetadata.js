const {
  Nft,
  ProviderInstance,
  getHash,
  Aquarius
} = require('@oceanprotocol/lib');
const { SHA256 } = require('crypto-js');
const Web3 = require('web3');
const { web3Provider, oceanConfig } = require('./config');
const { ddo, files } = require('./data');

const web3 = new Web3(web3Provider);
const aquarius = new Aquarius(oceanConfig.metadataCacheUri);
const nft = new Nft(web3);
const providerUrl = oceanConfig.providerUri;

const dataNFTAddress = "0xF2231f1978363e958750497e75a3449219b03851";
const datatokenAddress = "0xA07C22622772E72E45370Cc265C547b6af4AFD3A";

console.log(`DataNft address ${dataNFTAddress}`);
console.log(`Datatoken address ${datatokenAddress}`);

const setMetadata = async (erc721Address, datatokenAddress) => {
  const accounts = await web3.eth.getAccounts();
  const publisherAccount = accounts[0];

  // create the files encrypted string
  let providerResponse = await ProviderInstance.encrypt(files, providerUrl);
  ddo.services[0].files = providerResponse;
  ddo.services[0].datatokenAddress = datatokenAddress;
  // update ddo and set the right did
  ddo.nftAddress = erc721Address;
  const chain = await web3.eth.getChainId();
  ddo.id = `did:op:${SHA256(
    web3.utils.toChecksumAddress(erc721Address) + chain.toString(10)
  )}`;

  providerResponse = await ProviderInstance.encrypt(ddo, providerUrl);
  const encryptedResponse = await providerResponse;
  const metadataHash = getHash(JSON.stringify(ddo));

  await nft.setMetadata(
    erc721Address,
    publisherAccount,
    0,
    providerUrl,
    '',
    '0x2',
    encryptedResponse,
    `0x${metadataHash}`
  );

  await aquarius.waitForAqua(ddo.id);

  console.log(`Resolved asset did [${ddo.id}]from aquarius.`);
};


setMetadata(dataNFTAddress, datatokenAddress).then(() => {
  console.log('Metadata set.');
  process.exit();
}).catch((err) => {
  console.error(err);
  process.exit(1);
});;


