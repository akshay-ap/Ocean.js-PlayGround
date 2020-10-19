const { Ocean, ConfigHelper, DataTokens } = require("@oceanprotocol/lib");
const Web3 = require("web3");
const {
  factoryABI,
} = require("@oceanprotocol/contracts/artifacts/DTFactory.json");
const {
  datatokensABI,
} = require("@oceanprotocol/contracts/artifacts/DataTokenTemplate.json");
const { config, contracts, urls } = require("./config");

const init = async () => {
  const ocean = await Ocean.getInstance(config);
  return ocean;
};

const createDT = async (ocean) => {
  const blob = `${urls.providerUri}/api/v1/provider/services`;

  const accounts = await ocean.accounts.list();
  const account_address = accounts[0].id;

  const datatoken = new DataTokens(
    contracts.DTFactory,
    factoryABI,
    datatokensABI,
    new Web3(urls.networkUrl)
  );
  const tokenAddress = await datatoken.create(blob, account_address);
  console.log(`Deplyod datatoken address: ${tokenAddress}`);
};

init()
  .then(async (res) => {
    await createDT(res);
  })
  .catch((err) => {
    console.error(err);
  });
