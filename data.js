const dummyDataAsset = {
  main: {
    type: "dataset",
    name: "test-dataset",
    dateCreated: new Date(Date.now()).toISOString().split(".")[0] + "Z",
    author: "test",
    license: "MIT",
    files: [
      {
        url: "https://raw.githubusercontent.com/trentmc/branin/main/branin.arff",
        index: 0,
        contentType: "text/text"
      }
    ],
  },
};

const dummyAlgoAsset = {
  main: {
    type: 'algorithm',
    name: 'Test Algo with Compute',
    dateCreated: new Date(Date.now()).toISOString().split(".")[0] + "Z",
    datePublished: new Date(Date.now()).toISOString().split(".")[0] + "Z",
    author: 'DevOps',
    license: 'CC-BY',
    files: [
      {
        url: 'https://raw.githubusercontent.com/oceanprotocol/test-algorithm/master/javascript/algo.js',
        contentType: 'text/js',
        encoding: 'UTF-8'
      }
    ],
    algorithm: {
      language: 'js',
      format: 'docker-image',
      version: '0.1',
      container: {
        entrypoint: 'node $ALGO',
        image: 'node',
        tag: '10'
      }
    }
  }
};

const ddo = {
  '@context': ['https://w3id.org/did/v1'],
  id: 'did:op:efba17455c127a885ec7830d687a8f6e64f5ba559f8506f8723c1f10f05c049c',
  version: '4.0.0',
  chainId: 4,
  nftAddress: '0x0',
  metadata: {
    created: '2021-12-20T14:35:20Z',
    updated: '2021-12-20T14:35:20Z',
    type: 'dataset',
    name: 'dfgdfgdg',
    description: 'd dfgd fgd dfg dfgdfgd dfgdf',
    tags: [''],
    author: 'dd',
    license: 'https://market.oceanprotocol.com/terms',
    additionalInformation: {
      termsAndConditions: true
    }
  },
  services: [
    {
      id: 'notAnId',
      type: 'access',
      files: '',
      datatokenAddress: '0xa15024b732A8f2146423D14209eFd074e61964F3',
      serviceEndpoint: 'https://providerv4.rinkeby.oceanprotocol.com',
      timeout: 0
    }
  ]
}

const files = [
  {
    type: 'url',
    url: 'https://raw.githubusercontent.com/oceanprotocol/testdatasets/main/shs_dataset_test.txt',
    method: 'GET'
  }
]

module.exports = { ddo, files };