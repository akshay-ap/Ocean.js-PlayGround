const { NftFactory, Datatoken } = require("@oceanprotocol/lib");
const { provider, oceanConfig } = require('./config');
const Web3 = require("web3");

const web3 = new Web3(provider);

const createDataNFT = async (web3) => {
    const Factory = new NftFactory(oceanConfig.erc721FactoryAddress, web3);

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

    return {
        erc721Address,
        datatokenAddress
    }
}

createDataNFT(web3).then(async ({ erc721Address,
    datatokenAddress }) => {

    const accounts = await web3.eth.getAccounts();
    const alice = accounts[0];
    const bob = accounts[1];

    const datatoken = new Datatoken(web3);

    await datatoken.mint(datatokenAddress, alice, '1', alice)
    await datatoken.transfer(datatokenAddress, bob, '1', alice)

    const bobBalance = await datatoken.balance(datatokenAddress, bob)
    console.log(`Bob balance ${bobBalance}`)

    process.exit();

}).catch(err => {
    console.error(err);
    process.exit(1);
})

