import collectionsABI from './CollectionsABI.json'
import { address as ColletionsLocalAddress } from './ColletionsLocalAddress.json'
export default {
  ipfsGateway: { host: 'ipfs.infura.io', port: 5001, protocol: 'https' },

  contracts: {
    collections: {
      address: {
        localhost: ColletionsLocalAddress,
        mainnet: '',
        ropsten: ''
      },
      abi: collectionsABI
    }
  }
}
