const { ProviderInstance, Aquarius } = require('@oceanprotocol/lib');
const Web3 = require('web3');
const { provider, oceanConfig } = require('./config');

const web3 = new Web3(provider);
const aquarius = new Aquarius(oceanConfig.metadataCacheUri);
const providerUrl = oceanConfig.providerUri;

const startComputeJob = async (algoDid, datasetDid) => {
  const resolvedDataDdo = await aquarius.waitForAqua(datasetDid);
  const resolvedAlgoDdo = await aquarius.waitForAqua(algoDid);
  const accounts = await web3.eth.getAccounts();
  const consumerAccount = '0x231175b81EEBf67216ecbbf843525c5f34cB2C3C';
  //accounts[1];

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
    'did:op:c4a7b91fbdd7f43d87de207d47b23370e73a4d0aac994c6e91655f99494415b0';

  const algoDid =
    'did:op:19bb9e3a7e406717b7913b1bde76b96f6c84a8d14b23589a6a8682ce7e981c34';

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
