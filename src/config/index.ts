import { abi as collectionsABI } from './CollectionsABI.json'
export default {
  ipfsGateway: { host: 'ipfs.infura.io', port: 5001, protocol: 'https' },

  contracts: {
    collections: {
      address: '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24',
      abi: collectionsABI
    }
  }
}
