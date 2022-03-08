const {
  NftFactory,
  Nft,
  ProviderInstance,
  Datatoken,
  getHash,
  Aquarius,
  downloadFile
} = require('@oceanprotocol/lib');
const { SHA256 } = require('crypto-js');
const fs = require('fs');
const Web3 = require('web3');
const { provider, addresses, urls } = require('./config');
const { ddo, files } = require('./data');

const web3 = new Web3(provider);
const aquarius = new Aquarius(urls.aquarius);
const nft = new Nft(web3);
const { providerUrl } = urls;
const Factory = new NftFactory(addresses.ERC721Factory, web3);

const createDataNFTWithMetadata = async () => {
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

  // create the files encrypted string
  let providerResponse = await ProviderInstance.encrypt(files, providerUrl);
  ddo.services[0].files = await providerResponse;
  ddo.services[0].datatokenAddress = datatokenAddress;
  // update ddo and set the right did
  ddo.nftAddress = erc721Address;
  const chain = await web3.eth.getChainId();
  ddo.id = `did:op:${
    SHA256(web3.utils.toChecksumAddress(erc721Address) + chain.toString(10))}`;

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
  return ddo.id;
};

const consumeDataAsset = async (did) => {
  const resolvedDDO = await aquarius.waitForAqua(did);
  const datatokenAddress = resolvedDDO.datatokens[0].address;
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

  const initializeData = await ProviderInstance.initialize(
    resolvedDDO.id,
    resolvedDDO.services[0].id,
    0,
    consumerAccount,
    providerUrl
  );

  const providerFees = {
    providerFeeAddress: initializeData.providerFee.providerFeeAddress,
    providerFeeToken: initializeData.providerFee.providerFeeToken,
    providerFeeAmount: initializeData.providerFee.providerFeeAmount,
    v: initializeData.providerFee.v,
    r: initializeData.providerFee.r,
    s: initializeData.providerFee.s,
    providerData: initializeData.providerFee.providerData,
    validUntil: initializeData.providerFee.validUntil
  };

  // make the payment
  const txid = await datatoken.startOrder(
    datatokenAddress,
    consumerAccount,
    consumerAccount,
    0,
    providerFees
  );
  // get the url
  const downloadURL = await ProviderInstance.getDownloadUrl(
    ddo.id,
    consumerAccount,
    ddo.services[0].id,
    0,
    txid.transactionHash,
    providerUrl,
    web3
  );

  try {
    const fileData = await downloadFile(downloadURL);
    console.log('fileData', fileData);
    fs.writeFileSync(`data/${fileData.filename}`, Buffer.from(fileData.data));
  } catch (e) {
    console.error(e);
  }
};

createDataNFTWithMetadata()
  .then((did) => {
    console.log(`Did: ${did}`);
    consumeDataAsset(did).then(() => {
      console.log('Data asset consumed');
      process.exit();
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
