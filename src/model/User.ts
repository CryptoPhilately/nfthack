import EventEmitter from './EventEmitter'
import DB from './DB'

declare global {
  interface Window {
    ethereum:any;
    Web3:any;
  }
}

const chains = {
  '0x1': 'mainnet',
  '0x2a': 'kovan',
  '0x3': 'ropsten',
  '0x4': 'rinkeby',
  '0x5': 'goerli',
  '0x539': 'localhost'
}

const isConnectedPromise = new Promise(resolve => {
  if (!localStorage.currentAddress || localStorage.currentAddress === 'null') resolve(null)
  if (window.ethereum.selectedAddress) resolve(window.ethereum.chainId)
  window.ethereum.on('connect', data => {
    console.info('ethereum.on(connect')
    setTimeout(() => {
      resolve(data)
    }, 100)
  })

  window.ethereum._metamask.isUnlocked().then(unlocked => {
    if (!unlocked) {
      console.info('MetaMask is locked')
      delete localStorage.currentAddress
      resolve(null)
    }
  })
})

export default new class User extends EventEmitter {
  private isReady:boolean
  public web3:any
  public DB:any
  constructor () {
    super()
    if (!this.metamaskExist()) { return }

    window.ethereum.on('accountsChanged', accounts => {
      localStorage.currentAddress = window.ethereum.selectedAddress
      console.info('account changed to ', localStorage.currentAddress)
      window.location.reload()
    })

    window.ethereum.on('chainChanged', chainId => {
      console.info('network changed to ', chainId, chains[chainId])
      window.location.reload()
    })

    isConnectedPromise.then(() => {
      if (window.ethereum.selectedAddress) { this.login() }
      this.web3 = new window.Web3(window.ethereum)
      this.isReady = true
      this.emit('ready', {})
      this.initDatabase()
    })
  }

  initDatabase () {
    if (!window.ethereum.selectedAddress) { return }
    // use differents datbases for different networks and accounts
    const dbName = window.ethereum.chainId + '-' + window.ethereum.selectedAddress
    this.DB = new DB(dbName)
  }

  metamaskExist ():boolean {
    return !!window.ethereum
  }

  isConnected ():boolean {
    return (localStorage.currentAddress && localStorage.currentAddress.substr(0, 2) === '0x')
  }

  async isLocked ():Promise<boolean> {
    return !(await window.ethereum._metamask.isUnlocked())
  }

  ready ():Promise<any> {
    return new Promise(resolve => {
      if (this.isReady) resolve(true)
      this.on('ready', resolve)
    })
  }

  async login ():Promise<string> {
    const addresses = await window.ethereum.request({ method: 'eth_requestAccounts' })

    localStorage.currentAddress = window.ethereum.selectedAddress

    this.emit('address:changed', localStorage.currentAddress)
    return addresses
  }

  getNetwork () {
    return chains[window.ethereum.chainId] || 'localhost'
  }
}()
