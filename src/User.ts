
declare global {
  interface Window {
    ethereum:any;
    Web3:any;
  }
}

export default new class User {
  public web3:any
  constructor () {
    this.web3 = new window.Web3(window.ethereum)
  }
}()
