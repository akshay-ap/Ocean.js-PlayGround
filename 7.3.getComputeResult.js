const { ProviderInstance, Aquarius } = require('@oceanprotocol/lib');
const Web3 = require('web3');
const { web3Provider, oceanConfig, web3Instance } = require('./config');
// const HDWalletProvider = require('@truffle/hdwallet-provider');

const web3 = new Web3(web3Provider);
const aquarius = new Aquarius(oceanConfig.metadataCacheUri);
const providerUrl = oceanConfig.providerUri;

const getData = async (url) => {
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json'
    }
  });
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

const getEResult = async () => {
  const res = await getComputeResultUrl(
    providerUrl,
    web3Instance,
    '0xdF1dEc52e602020E27B0644Ea0F584b6Eb5CE4eA',
    'd1345d72477649f8a2bda2062c4c17f9',
    0
  );
  console.log('res', res);
};

const getEndpointURL = (servicesEndpoints, serviceName) => {
  if (!servicesEndpoints) return null;
  return servicesEndpoints.find((s) => s.serviceName === serviceName);
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

const getComputeResultUrl = async (
  providerUri,
  web3,
  consumerAddress,
  jobId,
  index
) => {
  const providerEndpoints = await getEndpoints(providerUri);
  const serviceEndpoints = await getServiceEndpoints(
    providerUri,
    providerEndpoints
  );
  const computeResultUrl = getEndpointURL(serviceEndpoints, 'computeResult')
    ? getEndpointURL(serviceEndpoints, 'computeResult').urlPath
    : null;

  const nonce = Date.now();
  let signatureMessage = consumerAddress;
  signatureMessage += jobId;
  signatureMessage += index.toString();
  signatureMessage += nonce;
  const signature = (
    await signProviderRequest(web3, consumerAddress, signatureMessage)
  )['signature'];

  console.log(signature);
  if (!computeResultUrl) return null;
  let resultUrl = computeResultUrl;
  resultUrl += `?consumerAddress=${consumerAddress}`;
  resultUrl += `&jobId=${jobId}`;
  resultUrl += `&index=${index.toString()}`;
  resultUrl += `&nonce=${nonce}`;
  resultUrl += (signature && `&signature=${signature}`) || '';
  return resultUrl;
};

getEResult()
  .then(() => {
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(-1);
  });
