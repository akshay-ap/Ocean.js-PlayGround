const {
  NftFactory,
  Nft,
  ProviderInstance,
  Datatoken,
  getHash,
  Aquarius
} = require('@oceanprotocol/lib');
const { SHA256 } = require('crypto-js');
const Web3 = require('web3');
const { provider, oceanConfig } = require('./config');

const { dataDDo, datasetUrl } = require('./sample_ddo/dataDDo');
const { algoDDo, algoAssetUrl } = require('./sample_ddo/algo');

const web3 = new Web3(provider);
const aquarius = new Aquarius(oceanConfig.metadataCacheUri);
const nft = new Nft(web3);
const providerUrl = oceanConfig.providerUri;
const Factory = new NftFactory(oceanConfig.erc721FactoryAddress, web3);

const mintAndtransfer = async (
  datatokenAddress,
  publisherAccount,
  publisherAddress,
  consumerAddress
) => {
  const datatoken = new Datatoken(web3);
  await datatoken.mint(
    datatokenAddress,
    publisherAddress,
    '100',
    consumerAddress
  );
};

const createDataNFTWithMetadata = async (ddo, files) => {
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

  // create the files encrypted string
  let providerResponse = await ProviderInstance.encrypt(files, providerUrl);
  ddo.services[0].files = await providerResponse;
  ddo.services[0].datatokenAddress = datatokenAddress;
  ddo.services[0].serviceEndpoint = providerUrl;
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

  await mintAndtransfer(
    datatokenAddress,
    publisherAccount,
    publisherAccount,
    accounts[1]
  );

  return ddo.id;
};

(async () => {
  try {
    const dataDid = await createDataNFTWithMetadata(dataDDo, datasetUrl);
    console.log(`Dataset did ${dataDid}`);
    const algoDid = await createDataNFTWithMetadata(algoDDo, algoAssetUrl);
    console.log(`Algo did ${algoDid}`);
    process.exit();
  } catch (e) {
    console.log(e);
  }
})().catch((error) => {
  throw error;
});
