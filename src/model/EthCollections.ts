import config from '@config/index'
import EventEmitter from './EventEmitter'
import IPFS from '@model/IPFS'
import User from '@model/User'
import MerkleTree from '@model/merkle/index'
import { web3soliditySha3 } from '@model/merkle/utils'

export default class EthCollections extends EventEmitter {
  private web3:any
  public Contract:any
  public address:string
  constructor (web3, network) {
    super()
    this.web3 = web3
    const { abi, address } = config.contracts.collections

    if (!address[network]) {
      alert(`Network ${network} not supported, contract not deployed...`)
      return
    }
    this.address = address[network]
    this.Contract = new this.web3.eth.Contract(abi, this.address)
  }

  async createCollection ({ id, name, description, ticker, denomination, items }) {
    console.info('Create collection', { id, name, description, ticker, denomination, items })
    const collectionData:any = { name, description, ticker, denomination, items: [] }

    // Upload items to IPFS
    console.info('Upload items to IPFS')
    this.emit('create:status', { text: 'Uploading items to IPFS' })
    collectionData.items = await Promise.all(items.map(async item => {
      const data4ipfs = {
        name: item.name,
        description: item.description,
        denomination: item.denomination,
        image: item.image
      }
      item.URI = await IPFS.addJSON(data4ipfs)
      console.info(`Item ${item.id} uploaded, ${item.URI}`)
      item.status = 'ipfs'
      await User.DB.stamps.update(item.id, item)
      return { URI: item.URI, ...data4ipfs }
    }))

    this.emit('create:status', { text: 'Items uploaed' })
    console.info(`All ${items.length} items uploaded`, collectionData.items)

    // Upload collection data to IPFS
    this.emit('create:status', { text: 'Upload collection data to IPFS' })
    console.info('Upload collection to IPFS', collectionData)
    collectionData.URI = await IPFS.addJSON(collectionData)
    console.info('Collection data uploaded', collectionData.URI)
    await User.DB.groups.update(id, { status: 'ipfs', URI: collectionData.URI })
    this.emit('create:status', { text: 'Collection uploaded' })

    // Generate merkle tree
    console.info('Create merkle elements')
    const merkleElements = collectionData.items.map(item => {
      console.log('web3soliditySha3', item.denomination, item.URI)
      return web3soliditySha3(
        { v: Math.ceil(item.denomination), t: 'uint256' },
        { v: item.URI, t: 'string' }
      )
    })
    const merkleRoot = (new MerkleTree(merkleElements, false)).getRootHex()
    console.info('merkleRoot', merkleRoot)

    // Write colletion to contract
    console.info('contract', this.address, this.Contract.methods)
    console.info('start transaction', collectionData)
    this.emit('create:status', { text: 'Write collection to blockchain' })
    const TX = await this.Contract.methods.createCollection(
      collectionData.name,
      collectionData.ticker,
      collectionData.denomination,
      merkleRoot,
      'ipfs://' + collectionData.URI
    ).send({ from: this.web3.currentProvider.selectedAddress, to: this.address })

    this.emit('create:status', { text: 'Transaction sended' })

    await User.DB.groups.update(id, { status: 'minted' })

    return TX
  }
}
