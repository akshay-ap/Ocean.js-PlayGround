const { Ocean, ConfigHelper, DataTokens } = require("@oceanprotocol/lib");
const Web3 = require("web3");
const { config, contracts, urls } = require("./config");
const {
  OceanPool,
} = require("@oceanprotocol/lib/dist/node/balancer/OceanPool");

const {
  factoryABI,
} = require("@oceanprotocol/contracts/artifacts/DTFactory.json");
const {
  datatokensABI,
} = require("@oceanprotocol/contracts/artifacts/DataTokenTemplate.json");

const OceanPoolFactory = require("@oceanprotocol/contracts/artifacts/BFactory.json");
const OceanSPool = require("@oceanprotocol/contracts/artifacts/BPool.json");

const init = async () => {
  const ocean = await Ocean.getInstance(config);
  return ocean;
};

const createDT = async (ocean, name, symbol) => {
  const blob = `${urls.providerUri}/api/v1/provider/services`;

  const accounts = await ocean.accounts.list();
  const account_address = accounts[0].id;

  const datatoken = new DataTokens(
    contracts.DTFactory,
    factoryABI,
    datatokensABI,
    new Web3(urls.networkUrl)
  );
  const tokenAddress = await datatoken.create(
    blob,
    account_address,
    "1000000000",
    name,
    symbol
  );

  await datatoken.mint(
    tokenAddress,
    account_address,
    "1000000000",
    account_address
  );
  console.log(`Deplyod datatoken address: ${tokenAddress}`);
  return tokenAddress;
};

init()
  .then(async (ocean) => {
    const accounts = await ocean.accounts.list();

    const tokenAddress = await createDT(ocean, "My data token", "MDT");
    const oceanTokenAddress = await createDT(ocean, "OceanToken", "OCN");

    const pool = new OceanPool(
      config.web3Provider,
      OceanPoolFactory.abi,
      OceanSPool.abi,
      contracts.BFactory,
      oceanTokenAddress
    );
    const poolAddress = await pool.createDTPool(
      accounts[0].id,
      tokenAddress,
      "10",
      "1",
      "0.02"
    );

    console.log(`Pool address: ${poolAddress}`);

    const s = await pool.getPoolSharesTotalSupply(poolAddress);
    console.log(`Pool supply: ${s}`);
    const n = await pool.getNumTokens(poolAddress);
    console.log(`Pool number of tokens in pool: ${n}`);

    const currentSwapFee = await pool.getSwapFee(poolAddress);
    console.log(`Pool swap fee: ${currentSwapFee}`);

    const requiredOcean = await pool.getOceanNeeded(poolAddress, "1");
    console.log(`requiredOcean for 1 dt: ${requiredOcean}`);

    const spotPrice = await pool.getSpotPrice(
      poolAddress,
      tokenAddress,
      oceanTokenAddress
    );
    console.log(`spot price: ${spotPrice}`);

    const currentDtPrice = await pool.getDTPrice(poolAddress);
    console.log(`Current Datatoken price: ${currentDtPrice}`);

    const currentOceanReserve = await pool.getOceanReserve(poolAddress);
    console.log(`Current ocean reserve: ${currentOceanReserve}`);

    const currentDtReserve = await pool.getDTReserve(poolAddress);
    console.log(`Current dataToken reserve: ${currentDtReserve}`);
  })

  .catch((err) => {
    console.error(err);
  });
