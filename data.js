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

const genericAsset = {
  '@context': ['https://w3id.org/did/v1'],
  id: 'testFakeDid',
  version: '4.0.0',
  chainId: 4,
  nftAddress: '0x0',
  metadata: {
    created: '2021-12-20T14:35:20Z',
    updated: '2021-12-20T14:35:20Z',
    name: 'dataset-name',
    type: 'dataset',
    description: 'Ocean protocol test dataset description',
    author: 'oceanprotocol-team',
    license: 'MIT',
    tags: ['white-papers'],
    additionalInformation: { 'test-key': 'test-value' },
    links: ['http://data.ceda.ac.uk/badc/ukcp09/']
  },
  services: [
    {
      id: 'testFakeId',
      type: 'access',
      description: 'Download service',
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

module.exports = { dummyAsset: dummyDataAsset, dummyAlgoAsset, genericAsset, files };
