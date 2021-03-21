import config from '@config/index'
import EventEmitter from './EventEmitter'
import IPFS from '@model/IPFS'
import User from '@model/User'
import MerkleTree from '@model/merkle/index'
import { web3soliditySha3 } from '@model/merkle/utils'

export default new class EthCollections extends EventEmitter {
  private web3:any
  private fetchCollectionsPromise:Promise<any>
  private fetchFromIPFSPromise:Promise<any>
  public Collections:any[] = []
  public Contract:any
  public address:string
  constructor () {
    super()
    const { abi, address } = config.contracts.collections

    User.ready().then(() => {
      this.web3 = User.web3
      const network = User.getNetwork()

      if (!address[network]) {
        alert(`Network ${network} not supported, contract not deployed...`)
        return
      }
      this.address = address[network]
      this.Contract = new this.web3.eth.Contract(abi, this.address)

      this.fetchCollectionsPromise = this.fetchCollections()
      this.fetchCollectionsFromIPFS()
    })
  }

  // Save data to IPFS
  // and send CID to blockchain
  async createCollection (groupId:number):Promise<any> {
    const [group, stamps] = await Promise.all([
      User.DB.groups.get(groupId),
      User.DB.stamps.where({ groupId }).toArray()
    ])

    // Upload items to IPFS
    this.emit('create:status', { text: 'Uploading items to IPFS' })
    // @TODO: write types for this Object
    const collectionData:any = {
      name: group.name,
      description: group.desc,
      ticker: group.ticker,

      denomination: stamps.reduce((sum, stamp) => {
        sum += Math.ceil(Number(stamp.denomination))
        return sum
      }, 0),

      items: await Promise.all(stamps.map(async item => {
        const data4ipfs = {
          name: item.name,
          description: item.desc,
          denomination: item.denomination,
          image: item.image
        }
        // save item to ipfs
        item.URI = await IPFS.addJSON(data4ipfs)
        console.info(`Item ${item.id} uploaded, ${item.URI}`)
        item.status = 'ipfs'
        // write uri to local DB
        User.DB.stamps.update(item.id, item)
        return { URI: item.URI, ...data4ipfs }
      }))
    }

    this.emit('create:status', { text: 'Items uploaed' })
    console.info(`All ${collectionData.items.length} items uploaded`, collectionData.items)

    // Upload collection data to IPFS
    this.emit('create:status', { text: 'Upload collection data to IPFS' })
    console.info('Upload collection to IPFS', collectionData)
    collectionData.URI = await IPFS.addJSON(collectionData)
    console.info('Collection data uploaded', collectionData.URI)
    User.DB.groups.update(groupId, { status: 'ipfs', URI: collectionData.URI })
    this.emit('create:status', { text: 'Collection uploaded' })

    // Generate merkle tree
    console.info('Create merkle elements')
    const merkleElements = collectionData.items.map(item => web3soliditySha3(
      { v: Math.ceil(item.denomination), t: 'uint256' },
      { v: item.URI, t: 'string' }
    ))
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

    if (TX?.transactionHash) {
      this.fetchCollectionsPromise = this.fetchCollections()
      await Promise.all([
        User.DB.groups.update(groupId, { status: 'minted', TX: TX.transactionHash, txdata: TX }),
        ...stamps.map(stamp => User.DB.stamps.update(stamp.id, { status: 'minted' }))
      ])
    }

    return TX
  }

  // get collections from smart contract
  async fetchCollections () {
    console.info('fetch collections from blockchain')
    const user = this.web3.currentProvider.selectedAddress
    let collectionIndex = this.Collections.length
    while (collectionIndex >= 0) {
      console.log('collectionIndex', collectionIndex)
      const collectionId = await this.Contract.methods.tokenOfOwnerByIndex(user, collectionIndex).call().catch(() => {
        collectionIndex = -10
      })
      collectionIndex++

      if (collectionId) {
        const collectionData = await this.Contract.methods.collections(collectionId).call()
        collectionData.id = collectionId
        collectionData.index = collectionIndex
        collectionData.URI = collectionData.URI.replace('ipfs://', '')
        this.Collections.push(collectionData)
      }
    }
  }

  async fetchCollectionsFromIPFS () {
    const runFetch = async () => {
      await this.fetchCollectionsPromise
      const localURIs = (await User.DB.groups.toArray()).map(g => g.URI)
      const fetchURIs = this.Collections.map(c => c.URI).filter(uri => !localURIs.includes(uri))

      await Promise.all(fetchURIs.map(async URI => {
        const collection = await IPFS.catJSON(URI)
        collection.desc = collection.description; delete collection.description
        const existGroup = await User.DB.groups.where({ URI }).toArray()
        if (existGroup.length) return
        const groupId = await User.DB.groups.add({ ...collection, URI, status: 'minted', stamps: collection.items.length })
        await Promise.all(collection.items.map(item => {
          item.desc = item.description; delete item.description
          return User.DB.stamps.add({ ...item, groupId, status: 'minted' })
        }))
        return collection
      }))
      // await new Promise(resolve => { setTimeout(resolve, 3000) })
    }
    // protection of multiple calls
    if (this.fetchFromIPFSPromise) return this.fetchFromIPFSPromise
    this.fetchFromIPFSPromise = runFetch()
    return this.fetchFromIPFSPromise
  }

  async getCollections () {
    await this.fetchCollectionsPromise
    return this.Collections
  }

  async getCollectionByURI (uri) {
    await this.fetchCollectionsPromise
    return this.Collections.find(col => col.URI === uri)
  }

  async depositCollection (groupId:number):Promise<any> {
    const user = this.web3.currentProvider.selectedAddress
    const group = await User.DB.groups.get(groupId)
    const collection = await this.getCollectionByURI(group.URI)
    if (!collection) {
      alert('Collection not found in contract')
      return
    }

    const depositoryAddress = await this.Contract.methods.getDepositoryContract(collection.id).call()
    const depositoryContract = new this.web3.eth.Contract(config.contracts.depository.abi, depositoryAddress)
    const approveDepositoryTX = await this.Contract.methods.approve(depositoryAddress, collection.id).send({ from: user, to: this.address })
    console.info({ approveDepositoryTX })

    const depositCollectionTX = await depositoryContract.methods.depositCollection(collection.id).send({
      from: user, to: depositoryAddress, gasLimit: 5400000
    }).catch(err => {
      console.error('depositCollectionTX', err)
    })
    console.info({ depositCollectionTX })

    if (depositCollectionTX?.transactionHash) {
      await User.DB.groups.update(groupId, { status: 'deposited' })
    }

    return depositCollectionTX
  }
}()
