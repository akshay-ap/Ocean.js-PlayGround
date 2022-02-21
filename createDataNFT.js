const { NftFactory, NftCreateData, getHash, Nft, ZERO_ADDRESS, ProviderInstance, Aquarius } = require("@oceanprotocol/lib");
const MockERC20 = require('hardhat-project/artifacts/contracts/utils/mock/MockERC20Decimals.sol/MockERC20Decimals.json')
const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const fs = require("fs");
const { homedir } = require('os');
const { SHA256 } = require('crypto-js');
const { assert } = require('chai');

const { genericAsset } = require("./data");
const { walletConfig, urls, files } = require("./config");

const provider = new HDWalletProvider(walletConfig.mnemonic, walletConfig.rpc);


const init = async () => {
    return;
};

const data = JSON.parse(
    fs.readFileSync(
        process.env.ADDRESS_FILE ||
        `${homedir}/.ocean/ocean-contracts/artifacts/address.json`,
        'utf8'
    )
)

const createNFT = async () => {
    const web3 = new Web3(provider);
    const addresses = data.development;
    const providerUrl = urls.providerUri;
    const aquarius = new Aquarius(urls.aquarius);

    const nft = new Nft(web3);
    console.log("NFT instance created")
    console.log("addresses.ERC721Factory", addresses.ERC721Factory)
    const factory = new NftFactory(addresses.ERC721Factory, web3);
    console.log("NFT factory created")
    const accounts = await web3.eth.getAccounts();
    console.log("accounts created");

    const daiContract = new web3.eth.Contract(
        MockERC20.abi,
        addresses.MockDAI
    )
    await daiContract.methods
        .approve(addresses.ERC721Factory, web3.utils.toWei('100000'))
        .send({ from: accounts[0] });

    const poolDdo = { ...genericAsset }
    const nftParams = {
        name: 'testNftPool',
        symbol: 'TSTP',
        templateIndex: 1,
        tokenURI: ''
    }
    const erc20Params = {
        templateIndex: 1,
        cap: '100000',
        feeAmount: '0',
        feeManager: ZERO_ADDRESS,
        feeToken: ZERO_ADDRESS,
        minter: accounts[0],
        mpFeeAddress: ZERO_ADDRESS
    }
    const poolParams = {
        ssContract: addresses.Staking,
        baseTokenAddress: addresses.MockDAI,
        baseTokenSender: addresses.ERC721Factory,
        publisherAddress: accounts[0],
        marketFeeCollector: accounts[0],
        poolTemplateAddress: addresses.poolTemplate,
        rate: '1',
        baseTokenDecimals: 18,
        vestingAmount: '10000',
        vestedBlocks: 2500000,
        initialBaseTokenLiquidity: '2000',
        swapFeeLiquidityProvider: '0.001',
        swapFeeMarketRunner: '0.001'
    }
    const bundleNFT = await factory.createNftErc20WithPool(
        accounts[0],
        nftParams,
        erc20Params,
        poolParams
    )

    const nftAddress = bundleNFT.events.NFTCreated.returnValues[0]
    const datatokenAddress = bundleNFT.events.TokenCreated.returnValues[0]
    const poolAdress = bundleNFT.events.NewPool.returnValues[0]

    const encryptedFiles = await ProviderInstance.encrypt(files, providerUrl)

    poolDdo.metadata.name = 'test-dataset-pool'
    poolDdo.services[0].files = await encryptedFiles
    poolDdo.services[0].datatokenAddress = datatokenAddress

    poolDdo.nftAddress = nftAddress
    const chain = await web3.eth.getChainId()
    poolDdo.chainId = chain
    poolDdo.id =
        'did:op:' + SHA256(web3.utils.toChecksumAddress(nftAddress) + chain.toString(10))

    const AssetValidation = await aquarius.validate(poolDdo)
    assert(AssetValidation.valid === true, 'Published asset is not valid')

    const encryptedDdo = await ProviderInstance.encrypt(poolDdo, providerUrl)
    const encryptedResponse = await encryptedDdo
    const metadataHash = getHash(JSON.stringify(poolDdo))
    // just to make sure that our hash matches one computed by aquarius
    assert(AssetValidation.hash === '0x' + metadataHash, 'Metadata hash is a missmatch')
    const tx = await nft.setMetadata(
        nftAddress,
        accounts[0],
        0,
        providerUrl,
        '',
        '0x2',
        encryptedResponse,
        '0x' + metadataHash,
        [AssetValidation.proof]
    )

    const resolvedDDO = await aquarius.waitForAqua(poolDdo.id)
    assert(resolvedDDO, 'Cannot fetch DDO from Aquarius')

    return;
}

init()
    .then(async () => {
        await createNFT();
        console.log("done");
        return;
    })
    .catch((err) => {
        console.error(err);
    });
