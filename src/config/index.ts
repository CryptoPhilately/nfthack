import collectionsABI from './CollectionsABI.json'
import { address as ColletionsLocalAddress } from './ColletionsLocalAddress.json'
export default {
  ipfsGateway: { host: 'ipfs.infura.io', port: 5001, protocol: 'https' },

  chains: {
    '0x1': 'mainnet',
    '0x2a': 'kovan',
    '0x3': 'ropsten',
    '0x4': 'rinkeby',
    '0x5': 'goerli',
    '0x539': 'localhost'
  },

  contracts: {
    collections: {
      address: {
        // mainnet: '',
        // kovan: '',
        // ropsten: '',
        rinkeby: '0xa84Fdc5a9b1C99c0a61b7bEbBee36Ff054380b06',
        // goerli: '',
        localhost: ColletionsLocalAddress
      },
      abi: collectionsABI
    }
  }
}
