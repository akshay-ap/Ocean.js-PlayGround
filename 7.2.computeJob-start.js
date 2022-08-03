const { ProviderInstance, Aquarius } = require('@oceanprotocol/lib');
const Web3 = require('web3');
const { provider, oceanConfig } = require('./config');
const HDWalletProvider = require('@truffle/hdwallet-provider');

const web3 = new Web3(provider);
const aquarius = new Aquarius(oceanConfig.metadataCacheUri);
const providerUrl = oceanConfig.providerUri;

const getConsumerAccount = async () => {

  const web3Provider2 = new HDWalletProvider(
    process.env.PRIVATE_KEY2,
    oceanConfig.nodeUri
  );
  const web3Consumer = new Web3(web3Provider2);
  const consumerAccount = (await web3Consumer.eth.getAccounts())[0];
  return consumerAccount;
}

const startComputeJob = async (algoDid, datasetDid) => {
  const resolvedDataDdo = await aquarius.waitForAqua(datasetDid);
  const resolvedAlgoDdo = await aquarius.waitForAqua(algoDid);
  const consumerAccount = await getConsumerAccount();

  const computeEnvs = await ProviderInstance.getComputeEnvironments(
    providerUrl
  );
  const computeEnv = computeEnvs[0].id;

  const assets = [
    {
      documentId: resolvedDataDdo.id,
      serviceId: resolvedDataDdo.services[0].id
    }
  ];
  const dtAddressArray = [resolvedDataDdo.services[0].datatokenAddress];

  const algo = {
    documentId: resolvedAlgoDdo.id,
    serviceId: resolvedAlgoDdo.services[0].id
  };

  const mytime = new Date();
  mytime.setMinutes(mytime.getMinutes() + 19);
  const computeValidUntil = Math.floor(mytime.getTime() / 1000);

  console.log('======================= starting compute', computeEnv);

  const providerInitializeComputeResults =
    await ProviderInstance.initializeCompute(
      assets,
      algo,
      computeEnv.id,
      computeValidUntil,
      providerUrl,
      consumerAccount
    );

  console.log(
    'providerInitializeComputeResults',
    providerInitializeComputeResults,
    computeValidUntil
  );

  const computeJobs = await ProviderInstance.computeStart(
    providerUrl,
    web3,
    consumerAccount,
    computeEnv,
    assets[0],
    algo
  );

  console.log('compute jobs', computeJobs);
};
const startCompute = async () => {
  const datasetDid =
    'did:op:658292ed40d5a274a06aaf8b491d7d72c444a60b06615035521e4a791076c874';

  const algoDid =
    'did:op:1900f36a18d2d7fd169a776c0d5686be694750d5c103e23e34b8c53395d4e435';

  await startComputeJob(algoDid, datasetDid);
};

(async () => {
  try {
    await startCompute();
    process.exit();
  } catch (e) {
    console.error(e);
  }
})();
