const { ProviderInstance, Aquarius, Datatoken } = require('@oceanprotocol/lib');
const Web3 = require('web3');
const { web3Provider, oceanConfig, web3Instance } = require('./config');
// const HDWalletProvider = require('@truffle/hdwallet-provider');

const web3 = new Web3(web3Provider);
const aquarius = new Aquarius(oceanConfig.metadataCacheUri);
const providerUrl = oceanConfig.providerUri;

// const getConsumerAccount = async () => {

//   const web3Provider2 = new HDWalletProvider(
//     process.env.PRIVATE_KEY2,
//     oceanConfig.nodeUri
//   );
//   const web3Consumer = new Web3(web3Provider2);
//   const consumerAccount = (await web3Consumer.eth.getAccounts())[0];
//   return { web3Provider2, consumerAccount };
// }

const approveWei = async (
  web3,
  config,
  account,
  tokenAddress,
  spender,
  amount,
  force,
  estimateGas
) => {
  const tokenContract = new web3.eth.Contract(minAbi, tokenAddress);
  if (!force) {
    const currentAllowence = await allowanceWei(
      web3,
      tokenAddress,
      account,
      spender
    );
    if (new BigNumber(currentAllowence).gt(new BigNumber(amount))) {
      return new Decimal(currentAllowence).toNumber();
    }
  }
  let result = null;
  const estGas = await calculateEstimatedGas(
    account,
    tokenContract.methods.approve,
    spender,
    amount
  );
  if (estimateGas) return estGas;
  try {
    result = await sendTx(
      account,
      estGas + 1,
      web3,
      config?.gasFeeMultiplier,
      tokenContract.methods.approve,
      spender,
      amount
    );
  } catch (e) {
    console.error('erere');
  }
  return result;
};

async function handleOrder(
  web3,
  order,
  datatokenAddress,
  payerAccount,
  consumerAccount,
  serviceIndex,
  consumeMarkerFee
) {
  let datatoken = new Datatoken(web3);
  if (order.providerFee && order.providerFee.providerFeeAmount) {
    console.log('To do');
    // await approveWei(
    //   web3,
    //   config,
    //   payerAccount,
    //   order.providerFee.providerFeeToken,
    //   datatokenAddress,
    //   order.providerFee.providerFeeAmount
    // );
  }
  if (order.validOrder) {
    if (!order.providerFee) return order.validOrder;
    const tx = await datatoken.reuseOrder(
      datatokenAddress,
      payerAccount,
      order.validOrder,
      order.providerFee
    );
    return tx.transactionHash;
  }
  const tx = await datatoken.startOrder(
    datatokenAddress,
    payerAccount,
    consumerAccount,
    serviceIndex,
    order.providerFee,
    consumeMarkerFee
  );
  return tx.transactionHash;
}

const startComputeJob = async (
  algoDid,
  datasetDid,
  datasetInput,
  algorithmInput
) => {
  const resolvedDataDdo = await aquarius.waitForAqua(datasetDid);
  const resolvedAlgoDdo = await aquarius.waitForAqua(algoDid);
  // const { web3Provider2, consumerAccount } = await getConsumerAccount();
  const consumerAccount = (await web3.eth.getAccounts())[0];

  const computeEnvs = await ProviderInstance.getComputeEnvironments(
    providerUrl
  );
  const computeEnv = computeEnvs[0].id;

  const assets = [
    {
      documentId: resolvedDataDdo.id,
      serviceId: resolvedDataDdo.services[0].id,
      userdata: datasetInput
    }
  ];
  const dtAddressArray = [resolvedDataDdo.services[0].datatokenAddress];

  const algo = {
    documentId: resolvedAlgoDdo.id,
    serviceId: resolvedAlgoDdo.services[0].id,
    algocustomdata: algorithmInput
  };

  const mytime = new Date();
  mytime.setMinutes(mytime.getMinutes() + 19);
  const computeValidUntil = Math.floor(mytime.getTime() / 1000);

  const providerInitializeComputeResults =
    await ProviderInstance.initializeCompute(
      assets,
      algo,
      computeEnv,
      computeValidUntil,
      providerUrl,
      consumerAccount
    );

  // Pay for dataset
  algo.transferTxId = await handleOrder(
    web3,
    providerInitializeComputeResults.algorithm,
    resolvedAlgoDdo.services[0].datatokenAddress,
    consumerAccount,
    computeEnvs[0].consumerAddress,
    0
  );

  assets[0].transferTxId = await handleOrder(
    web3,
    providerInitializeComputeResults.datasets[0],
    resolvedDataDdo.services[0].datatokenAddress,
    consumerAccount,
    computeEnvs[0].consumerAddress,
    0
  );

  const computeJobs = await computeStart(
    providerUrl,
    web3Instance,
    consumerAccount,
    computeEnv,
    assets[0],
    algo
  );

  console.log('compute jobs', computeJobs);
};

const getServiceEndpoints = async (providerEndpoint, endpoints) => {
  const serviceEndpoints = [];
  for (const i in endpoints.serviceEndpoints) {
    const endpoint = {
      serviceName: i,
      method: endpoints.serviceEndpoints[i][0],
      urlPath: providerEndpoint + endpoints.serviceEndpoints[i][1]
    };
    serviceEndpoints.push(endpoint);
  }
  return serviceEndpoints;
};

const signProviderRequest = async (web3, accountId, message, password) => {
  const consumerMessage = web3.utils.soliditySha3({
    t: 'bytes',
    v: web3.utils.utf8ToHex(message)
  });
  const isMetaMask =
    web3 && web3.currentProvider && web3.currentProvider.isMetaMask;
  if (isMetaMask)
    return await web3.eth.personal.sign(consumerMessage, accountId, password);
  else
    return await web3.eth.accounts.sign(
      consumerMessage,
      process.env.PRIVATE_KEY
    );
};

const getData = async (url) => {
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json'
    }
  });
};

const getEndpoints = async (providerUri) => {
  try {
    const endpoints = await getData(providerUri);
    return await endpoints.json();
  } catch (e) {
    // LoggerInstance.error('Finding the service endpoints failed:', e);
    console.error(e);
    throw new Error('HTTP request failed calling Provider');
  }
};

const computeStart = async (
  providerUri,
  web3,
  consumerAddress,
  computeEnv,
  dataset,
  algorithm,
  signal,
  additionalDatasets,
  output
) => {
  const providerEndpoints = await getEndpoints(providerUri);
  const serviceEndpoints = await getServiceEndpoints(
    providerUri,
    providerEndpoints
  );
  const computeStartUrl = getEndpointURL(serviceEndpoints, 'computeStart')
    ? getEndpointURL(serviceEndpoints, 'computeStart').urlPath
    : null;

  const nonce = Date.now();
  let signatureMessage = consumerAddress;
  signatureMessage += dataset.documentId;
  signatureMessage += nonce;
  const signature = await signProviderRequest(
    web3,
    consumerAddress,
    signatureMessage
  );
  const payload = Object();
  payload.consumerAddress = consumerAddress;
  payload.signature = signature['signature'];
  payload.nonce = nonce;
  payload.environment = computeEnv;
  payload.dataset = dataset;
  payload.algorithm = algorithm;
  if (payload.additionalDatasets)
    payload.additionalDatasets = additionalDatasets;
  if (output) payload.output = output;
  if (!computeStartUrl) return null;
  try {
    const response = await fetch(computeStartUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      signal
    });

    if (response?.ok) {
      const params = await response.json();
      return params;
    }
    console.error('error', payload);
    // LoggerInstance.error(
    //   'Compute start failed: ',
    //   response.status,
    //   response.statusText,
    //   await response.json()
    // );
    // LoggerInstance.error('Payload was:', payload);
    return null;
  } catch (e) {
    // LoggerInstance.error('Compute start failed:');
    // LoggerInstance.error(e);
    // LoggerInstance.error('Payload was:', payload);
    console.error(e);
    throw new Error('HTTP request failed calling Provider');
  }
};

const getEndpointURL = (servicesEndpoints, serviceName) => {
  if (!servicesEndpoints) return null;
  return servicesEndpoints.find((s) => s.serviceName === serviceName);
};

const startCompute = async () => {
  const datasetDid =
    'did:op:b3ca139ac816cc0afc2484f33fc48d164786d64887c141a300d1896419d145b3';

  const algoDid =
    'did:op:dc01470e0ec34abdc469379628e08e9abc472af1845e0b70e92457883a0c392c';

  const algorithmInput = {
    view: 'compute-data',
    'query-type': 'all',
    'design-doc': 'brainstem'
  };
  const datasetInput = {
    view: 'compute-data',
    'query-type': 'all',
    'design-doc': 'brainstem'
  };

  await startComputeJob(algoDid, datasetDid, datasetInput, algorithmInput);
};

(async () => {
  try {
    await startCompute();
    process.exit();
  } catch (e) {
    console.error(e);
  }
})();
