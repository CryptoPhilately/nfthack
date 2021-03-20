import config from '@config/index'

export default class EthCollections {
  private web3:any
  public Contract:any
  public address:string
  constructor (web3) {
    this.web3 = web3
    const { abi, address } = config.contracts.collections
    this.address = address
    this.Contract = new this.web3.eth.Contract(abi, address)
  }

  async createCollection (name, desc, ticket, items) {
    const collectionURI = 'ipfs://'
    const merkleRoot = this.web3.utils.randomHex(32)

    const tx = await this.Contract.methods.createCollection(
      'MyStamps',
      'MYSP',
      10,
      merkleRoot,
      collectionURI
    ).send({ from: this.web3.currentProvider.selectedAddress, to: this.address })

    console.log('TX', tx)
  }
}