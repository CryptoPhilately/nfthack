import config from '@config/index'

export default class EthCollections {
  private web3:any
  public Contract:any
  public address:string
  constructor (web3, network) {
    this.web3 = web3
    const { abi, address } = config.contracts.collections

    if (!address[network]) {
      alert(`Network ${network} not supported, contract, not deployed...`)
      return
    }
    this.address = address[network]
    this.Contract = new this.web3.eth.Contract(abi, this.address)
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
