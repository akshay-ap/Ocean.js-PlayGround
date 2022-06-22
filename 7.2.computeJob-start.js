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
  const consumerAccount = accounts[1];

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
    'did:op:33e1a5c53e81814f3125e393408112f2c30154be7a2c7063ff6d204695469c3e';

  const algoDid =
    'did:op:bd6a13b6b3a6aabc514963ccf8349d75584c96f34d730239fb8bac45b2c63d86';

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
