const algoDDo = {
  '@context': ['https://w3id.org/did/v1'],
  id: 'did:op:efba17455c127a885ec7830d687a8f6e64f5ba559f8506f8723c1f10f05c049c',
  version: '4.0.0',
  chainId: 4,
  nftAddress: '0x0',
  metadata: {
    created: '2022-06-13T14:35:20Z',
    updated: '2022-06-13T14:35:20Z',
    type: 'algorithm',
    name: 'dfgdfgdg',
    description: 'd dfgd fgd dfg dfgdfgd dfgdf',
    tags: ['dev', 'algo', 'test'],
    author: 'dd',
    license: 'https://market.oceanprotocol.com/terms',
    additionalInformation: {
      termsAndConditions: true,
      imageId: '000000000000a092',
      backendInstance: 'https://crab.dev.dataunion.app'
    },
    algorithm: {
      language: 'Node.js',
      version: '1.0.0',
      container: {
        entrypoint: 'node $ALGO',
        image: 'ubuntu',
        tag: 'latest',
        checksum: '44e10daa6637893f4276bb8d7301eb35306ece50f61ca34dcab550'
      }
    }
  },
  services: [
    {
      id: 'notAnId',
      type: 'access',
      files: '',
      datatokenAddress: '0x0',
      serviceEndpoint: 'https://providerv4.rinkeby.oceanprotocol.com',
      timeout: 0
    }
  ]
};

const algoAssetUrl = [
  {
    type: 'url',
    url: 'https://raw.githubusercontent.com/oceanprotocol/test-algorithm/master/javascript/algo.js',
    method: 'GET'
  }
];

module.exports = { algoDDo, algoAssetUrl };
