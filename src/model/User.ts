import config from '@config/index'
import EventEmitter from './EventEmitter'
import DB from './DB'

declare global {
  interface Window {
    ethereum:any;
    Web3:any;
  }
}

const isConnectedPromise = new Promise(resolve => {
  if (!localStorage.currentAddress || localStorage.currentAddress === 'null') resolve(null)
  if (window.ethereum?.selectedAddress) resolve(window.ethereum.chainId)
  window.ethereum?.on('connect', data => {
    console.info('ethereum.on(connect')
    setTimeout(() => {
      resolve(data)
    }, 100)
  })

  window.ethereum?._metamask.isUnlocked().then(unlocked => {
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
      console.info('network changed to ', chainId, config.chains[chainId])
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
    return config.chains[window.ethereum.chainId] || 'localhost'
  }

  networkSupported () {
    return !!config.contracts.collections.address[this.getNetwork()]
  }

  explorerLink (type, address) {
    const network = this.getNetwork()
    // if (network === 'localhost') { return `#${type}/${address}` }

    const subdomain = (network !== 'mainnet') ? network + '.' : ''
    return `https://${subdomain}etherscan.io/${type}/${address}`
  }
}()
