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
      if (!User.isConnected()) return
      this.web3 = User.web3
      const network = User.getNetwork()

      if (!address[network]) {
        // alert(`Network ${network} not supported, contract not deployed...`)
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
        // write uri to local DB
        await User.DB.stamps.update(item.id, { status: 'ipfs', URI: item.URI })
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
    const merkleElements = collectionData.items.map(i => this.itemForMerkleTree(i))
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

  itemForMerkleTree ({ denomination, URI }) {
    return web3soliditySha3(
      { v: Math.ceil(denomination), t: 'uint256' },
      { v: URI, t: 'string' }
    )
  }

  // get collections from smart contract
  async fetchCollections () {
    const user = this.web3.currentProvider.selectedAddress
    let collectionIndex = this.Collections.length
    while (collectionIndex >= 0) {
      const collectionId = await this.Contract.methods.tokenOfOwnerByIndex(user, collectionIndex).call().catch(() => {
        collectionIndex = -10
      })

      if (collectionId) {
        collectionIndex++

        const URI = await this.Contract.methods.tokenURI(collectionId).call()

        let advanced = {}
        try {
          advanced = await this.Contract.methods.collections(collectionId).call()
        } catch (err) { }
        this.Collections.push({
          ...advanced,
          id: collectionId,
          index: collectionIndex,
          URI: URI.replace('ipfs://', '')
        })
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

  async detachItem (stampId, groupId) {
    const [group, stamp, stamps] = await Promise.all([
      User.DB.groups.get(groupId),
      User.DB.stamps.get(stampId),
      User.DB.stamps.where({ groupId }).toArray()
    ])

    const collection = await this.getCollectionByURI(group.URI)
    if (!collection) {
      throw new Error(`Collection not found (URI ${group.URI})`)
    }

    const proof = (new MerkleTree(stamps.map(i => this.itemForMerkleTree(i)), false)).getProofHex(this.itemForMerkleTree(stamp))[0]
    if (!proof) {
      throw new Error('Cant create proof')
    }

    const TX = await this.Contract.methods.detachItem(
      collection.id,
      stamp.denomination,
      stamp.URI,
      proof
    ).send({ from: this.web3.currentProvider.selectedAddress, to: this.address })

    if (TX.transactionHash) {
      const depositoryAddress = await this.Contract.methods.getDepositoryContract(collection.id).call()
      await User.DB.stamps.update(stampId, {
        status: 'detached',
        groupId: -1,
        stampsContractAddress: collection.stampsContract,
        depositoryContractAddress: depositoryAddress
      })
    }

    return TX
  }

  async depositItem (stampId) {
    const user = this.web3.currentProvider.selectedAddress
    const stamp = await User.DB.stamps.get(stampId)

    const stampsContract = new this.web3.eth.Contract(config.contracts.stamps.abi, stamp.stampsContractAddress)
    const itemId = await stampsContract.methods.tokenOfOwnerByIndex(user, 0).call()
    const tokenURI = await stampsContract.methods.tokenURI(itemId).call()
    if (stamp.URI !== tokenURI) {
      throw new Error('Local and remote stamp URIs not match')
    }

    const depositoryContract = new this.web3.eth.Contract(config.contracts.depository.abi, stamp.depositoryContractAddress)

    const approveTx = await stampsContract.methods.approve(stamp.depositoryContractAddress, itemId).send({ from: user, to: this.address })
    console.info('approveTx', approveTx)

    const depositTX = await depositoryContract.methods.depositStamp(itemId).send({ from: user, to: this.address })
    console.info('depositTX', depositTX)

    await User.DB.stamps.update(stampId, { status: 'deposited' })

    return depositTX
  }
}()
