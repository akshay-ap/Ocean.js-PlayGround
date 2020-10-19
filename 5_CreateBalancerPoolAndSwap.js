const { Ocean, ConfigHelper, DataTokens } = require("@oceanprotocol/lib");
const Web3 = require("web3");
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

const { config, contracts, urls } = require("./config");
const { dummyAsset } = require("./data");

const init = async () => {
  const ocean = await Ocean.getInstance(config);
  return ocean;
};

const datatoken = new DataTokens(
  contracts.DTFactory,
  factoryABI,
  datatokensABI,
  new Web3(urls.networkUrl)
);

const createDT = async (ocean, name, symbol) => {
  const blob = `${urls.providerUri}/api/v1/provider/services`;

  const accounts = await ocean.accounts.list();
  const account_address = accounts[0].id;

  const tokenAddress = await datatoken.create(
    blob,
    account_address,
    "1000",
    name,
    symbol
  );

  console.log(`Deployed datatoken address: ${tokenAddress}`);
  return tokenAddress;
};

init()
  .then(async (ocean) => {
    const accounts = await ocean.accounts.list();
    const alice = accounts[0].id;
    const bob = accounts[1].id;

    console.log(`${"*".repeat(10)}\n Step 1`);

    // Create data token
    const tokenAddress = await createDT(ocean, "My data token", "MDT");

    await datatoken.mint(tokenAddress, alice, "500", alice);
    await datatoken.mint(tokenAddress, alice, "500", bob);

    //Publish asset
    service1 = await ocean.assets.createAccessServiceAttributes(
      accounts[0],
      10, // set the price in datatoken
      new Date(Date.now()).toISOString().split(".")[0] + "Z", // publishedDate
      0 // timeout
    );

    // publish asset
    console.log(`${"*".repeat(10)}\n Step 2`);
    const ddo = await ocean.assets.create(
      dummyAsset,
      accounts[0],
      [service1],
      tokenAddress
    );

    console.log(`did ${ddo.id}`);
    let aliceDTBal = await datatoken.balance(tokenAddress, alice);
    let bobDTBal = await datatoken.balance(tokenAddress, bob);

    console.log(`Datatoken balance: Alice: ${aliceDTBal}`);
    console.log(`Datatoken balance: Bob: ${bobDTBal}`);

    const oceanTokenAddress = await createDT(ocean, "OceanToken", "OCN");
    await datatoken.mint(oceanTokenAddress, alice, "500", alice);
    await datatoken.mint(oceanTokenAddress, alice, "500", bob);

    // const tokenAddress = "0x2594F948825C4d1878D4bF4515A03b7Ee9464498";

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
      "5",
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

    aliceDTBal = await datatoken.balance(tokenAddress, alice);
    bobDTBal = await datatoken.balance(tokenAddress, bob);

    console.log(`Datatoken balance: Alice: ${aliceDTBal}`);
    console.log(`Datatoken balance: Bob: ${bobDTBal}`);

    let account0OceanBal = await datatoken.balance(oceanTokenAddress, alice);
    let account1OceanBal = await datatoken.balance(oceanTokenAddress, bob);

    console.log(`Ocean balance: Alice: ${account0OceanBal}`);
    console.log(`Ocean balance: Bob: ${account1OceanBal}`);

    console.log(`${"*".repeat(10)}\n Step 3`);
    //Swap tokens
    const maxPrice = parseFloat(currentDtPrice) * 2;
    await pool.buyDT(accounts[1].id, poolAddress, "2", "4");
    const bobDtBalance = await datatoken.balance(tokenAddress, bob);
    const bobOceanBalance = await datatoken.balance(oceanTokenAddress, bob);
    console.log(`Bob DT Balance: ${bobDtBalance}`);
    console.log(`Bob Ocean Balance: ${bobOceanBalance}`);
  })

  .catch((err) => {
    console.error(err);
  });
