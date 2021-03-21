import collectionsABI from './CollectionsABI.json'
import depositoryABI from './DepositoryABI.json'
import stampsABI from './StampsABI.json'
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
    stamps: { abi: stampsABI },
    depository: { abi: depositoryABI },
    collections: {
      address: {
        // mainnet: '',
        // kovan: '',
        // ropsten: '',
        rinkeby: '0x4A7d14925d992Fb0B1dF7bbfa9F7bf440f11387D',
        // goerli: '',
        localhost: ColletionsLocalAddress
      },
      abi: collectionsABI
    }
  }
}
